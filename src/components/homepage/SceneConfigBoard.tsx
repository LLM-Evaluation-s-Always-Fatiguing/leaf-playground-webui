'use client';

import styled from '@emotion/styled';
import { Button, Card, Collapse, Flex, message, Space } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm, onFormValuesChange, onFormValidateSuccess, onFormValidateFailed } from '@formily/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SelectAgentModal from '@/components/agent/SelectAgentModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import CreateOrUpdateAgentModal from '@/components/agent/CreateOrUpdateAgentModal';
import SceneAgentConfig from '@/types/server/config/Agent';
import AgentCard from '@/components/agent/AgentCard';
import { useRouter } from 'next/navigation';
import merge from 'lodash/merge';
import { DefaultSceneInfoConfig } from '@/models/scene';
import useGlobalStore from '@/stores/global';
import ServerAPI from '@/services/server';
import EvaluatorConfig, { EvaluatorConfigData } from '@/types/server/Evaluator';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { MdOutlineHistory } from 'react-icons/md';
import TaskHistoryModal from '@/components/task/TaskHistoryModal';
import LocalAPI from '@/services/local';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useTheme } from 'antd-style';
import Scene from '@/types/server/meta/Scene';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import { SceneConfigData, SceneRoleConfig } from "@/types/server/config/Scene";
import { ActionConfig } from '@/types/server/config/Action';
import { MetricConfig } from '@/types/server/config/MetricConfig';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  position: relative;

  .historyButton {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: ${(props) => props.theme.borderRadius}px;
    background: ${(props) => props.theme.colorBgBase};
    ${(props) =>
      props.theme.isDarkMode
        ? `border: 1px solid ${props.theme.colorPrimary};`
        : 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);'}
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: ${(props) => props.theme.colorPrimary};
    font-size: 26px;
  }

  .title {
    font-size: 24px;
    font-weight: 500;
    z-index: 10;
  }

  .validate-status-indicator {
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background-color: ${(props) => props.theme.colorError};
  }

  .validate-status-indicator.valid {
    background-color: ${(props) => props.theme.colorSuccess};
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden auto;
  position: relative;
`;

const Footer = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: 55px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  padding: 0 20px;

  border-top: 1px solid ${(props) => props.theme.dividerColor};

  z-index: calc(var(--loading-overlay-default-z-index) + 1);
`;

const CustomCollapseWrapper = styled.div`
  .ant-collapse {
    border-radius: 0;
    border: none;

    .ant-collapse-item {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-color: ${(props) => props.theme.colorBorderSecondary};

      .ant-collapse-header {
        flex-direction: row-reverse !important;
        align-items: center !important;

        .ant-collapse-header-text + .ant-collapse-extra {
          margin-right: 8px;
        }
      }

      .ant-collapse-content {
        border-color: ${(props) => props.theme.colorBorderSecondary};
      }
    }

    > .ant-collapse-item:last-child {
      border-bottom: none;
    }
  }
`;

interface SceneConfigBoardProps {
  scene: Scene;
  taskHistory: WebUITaskBundleTaskInfo[];
}

function splitCreateSceneParamsToState(createSceneParams: CreateSceneParams): {
  sceneFormValues: any;
  roleAgentConfigsMap: Record<string, SceneAgentConfig[]>;
} {
  const configObj = createSceneParams.scene_obj_config.scene_config_data;
  const roleConfig = configObj.roles_config;
  const  sceneFormValues: Partial<SceneConfigData> = configObj;
  delete sceneFormValues.roles_config;
  const roleAgentConfigsMap: Record<string, SceneAgentConfig[]> = {}
  Object.keys(roleConfig).forEach((roleName)=>{
    if (roleConfig[roleName].agents_config) {
      roleAgentConfigsMap[roleName] = roleConfig[roleName].agents_config!;
    }
  })
  return  {
    sceneFormValues,
    roleAgentConfigsMap,
  }
}

const SceneConfigBoard = ({ scene, taskHistory }: SceneConfigBoardProps) => {
  const router = useRouter();
  const globalStore = useGlobalStore();

  const hasHistory = taskHistory.length > 0;
  const [taskHistoryModalOpen, setTaskHistoryModalOpen] = useState(false);

  const creatingSceneRef = useRef(false);
  const [creatingScene, setCreatingScene] = useState(false);

  const [sceneFormValid, setSceneFormValid] = useState(false);
  const sceneForm = useMemo(() => {
    return createForm({
      initialValues: {
        dataset_config: {
          path: 'AsakusaRinne/gaokao_bench',
          name: '2010-2022_History_MCQs',
          split: 'dev',
          question_column: 'question',
          golden_answer_column: 'answer',
          num_questions: 3,
        },
      },
      effects() {
        onFormValuesChange((form) => {
          form.validate();
        });
        onFormValidateSuccess(() => {
          setSceneFormValid(true);
        });
        onFormValidateFailed(() => {
          setSceneFormValid(false);
        });
      },
    });
  }, []);

  const [operatingRoleName, setOperatingRoleName] = useState<string>();
  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [roleAgentConfigsMap, setRoleAgentConfigsMap] = useState<Record<string, SceneAgentConfig[]>>({});
  const [operatingAgentMetadata, setOperatingAgentMetadata] = useState<SceneAgentMetadata>();
  const [operatingAgent, setOperatingAgent] = useState<{
    index: number;
    agent: SceneAgentConfig;
  }>();
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);

  const [evaluatorFormValid, setEvaluatorFormValid] = useState(false);
  const [evaluationMethod, setEvaluationMethod] = useState('evaluators');
  const evaluatorForm = useMemo(() => {
    return createForm({
      effects() {
        onFormValuesChange((form) => {
          setEvaluationMethod(form.values.evaluation_method);
          form.validate();
        });
        onFormValidateSuccess(() => {
          setEvaluatorFormValid(true);
        });
        onFormValidateFailed(() => {
          setEvaluatorFormValid(false);
        });
      },
    });
  }, []);

  useEffect(() => {
    const doFistFormValidate = async () => {
      try {
        await sceneForm.validate();
        setSceneFormValid(true);
      } catch {
        sceneForm.clearErrors();
        setSceneFormValid(false);
      }
      try {
        await evaluatorForm.validate();
        setEvaluatorFormValid(true);
      } catch {
        evaluatorForm.clearErrors();
        setEvaluatorFormValid(false);
      }
    };
    doFistFormValidate();
  }, []);

  return (
    <>
      <Container>
        <LoadingOverlay spinning={creatingScene} tip={'Creating scene task...'} />
        <Content>
          <Space direction={'vertical'}>
            <Card
              title={
                <Flex align={'center'}>
                  <div className={`validate-status-indicator ${sceneFormValid ? 'valid' : ''}`} />
                  <div
                    style={{
                      marginLeft: 8,
                    }}
                  >
                    Scene Parameters
                  </div>
                </Flex>
              }
              headStyle={{
                padding: '0 15px',
              }}
              bodyStyle={{
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <CustomCollapseWrapper>
                <Form form={sceneForm} labelCol={5} wrapperCol={16}>
                  <Collapse
                    defaultActiveKey={(scene.scene_metadata.configSchema.required as string[]) || []}
                    items={Object.entries(scene.scene_metadata.configSchema.properties || {})
                      .filter(([_, property]) => property.type)
                      .map(([key, property], index) => {
                        const required = (scene.scene_metadata.configSchema.required as string[]) || [];
                        return {
                          key: key,
                          label: property.title || key,
                          children: (
                            <FormilyDefaultSchemaField
                              name={key}
                              required={required.includes(key)}
                              schema={{
                                ...property,
                                title: undefined,
                                ...(property.type === 'object' ? { 'x-decorator': undefined } : {}),
                              }}
                            />
                          ),
                        };
                      })}
                  />
                </Form>
              </CustomCollapseWrapper>
            </Card>
            <Card
              title={'Agent List'}
              bodyStyle={{
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <CustomCollapseWrapper>
                <Collapse
                  defaultActiveKey={scene.scene_metadata.scene_definition.roles.map((r) => r.name)}
                  items={scene.scene_metadata.scene_definition.roles
                    .filter((r) => !r.is_static)
                    .map((role, index) => {
                      const maxAgents =
                        role.num_agents_range[1] > 0 ? role.num_agents_range[1] : Number.MAX_SAFE_INTEGER;
                      return {
                        key: role.name,
                        label: `${role.name} Agents (At least ${role.num_agents_range[0]} agent${
                          role.num_agents_range[0] > 1 ? 's' : ''
                        }${
                          role.num_agents_range[1] > 0
                            ? `, but no more than ${role.num_agents_range[1]} agent${
                                role.num_agents_range[1] > 1 ? 's' : ''
                              }`
                            : ''
                        })`,
                        children: (
                          <Space wrap={true}>
                            {(roleAgentConfigsMap[role.name] || []).length < maxAgents && (
                              <AgentCard
                                role={'add'}
                                onAddNewClick={() => {
                                  setOperatingRoleName(role.name);
                                  setSelectAgentModalOpen(true);
                                }}
                              />
                            )}
                            {(roleAgentConfigsMap[role.name] || []).map((agentConfig, index) => {
                              const agentsMetadata = scene.agents_metadata[role.name];
                              const sceneAgentMeta = agentsMetadata.find(
                                (m) => m.obj_for_import.obj === agentConfig.obj_for_import.obj
                              );
                              return (
                                <AgentCard
                                  key={index}
                                  role={'agent'}
                                  sceneAgentMeta={sceneAgentMeta}
                                  sceneAgentConfig={agentConfig}
                                  onEditButtonClick={() => {
                                    setOperatingRoleName(role.name);
                                    setOperatingAgentMetadata(sceneAgentMeta);
                                    setOperatingAgent({
                                      index,
                                      agent: agentConfig,
                                    });
                                    setCreateOrUpdateAgentModalOpen(true);
                                  }}
                                  onDeleteButtonClick={() => {
                                    const newRoleAgentConfigsMap = { ...roleAgentConfigsMap };
                                    newRoleAgentConfigsMap[role.name].splice(index, 1);
                                    setRoleAgentConfigsMap(newRoleAgentConfigsMap);
                                  }}
                                />
                              );
                            })}
                          </Space>
                        ),
                      };
                    })}
                />
              </CustomCollapseWrapper>
            </Card>
          </Space>
        </Content>
        <Footer>
          <Space>
            <Button
              size={'large'}
              disabled={creatingScene}
              style={{
                minWidth: '120px',
                fontSize: '18px',
                lineHeight: '1.2',
              }}
              onClick={async () => {
                await sceneForm.reset();
                await evaluatorForm.reset();
                setRoleAgentConfigsMap({});
              }}
            >
              Reset
            </Button>
            <Button
              loading={creatingScene}
              size={'large'}
              type={'primary'}
              style={{
                minWidth: '120px',
                fontSize: '18px',
                lineHeight: '1.2',
              }}
              onClick={async () => {
                if (creatingSceneRef.current) return;
                creatingSceneRef.current = true;
                setCreatingScene(true);
                try {
                  await sceneForm.validate();
                  await evaluatorForm.validate();
                  const noStaticRoles = scene.scene_metadata.scene_definition.roles.filter((r) => !r.is_static);
                  for (let i = 0; i < noStaticRoles.length; i++) {
                    const role = noStaticRoles[i];
                    const roleAgentConfigs = roleAgentConfigsMap[role.name] || [];
                    console.log(role.num_agents_range[0] > 0, roleAgentConfigs.length < role.num_agents_range[0]);
                    if (role.num_agents_range[0] > 0 && roleAgentConfigs.length < role.num_agents_range[0]) {
                      message.error(
                        `At least ${role.num_agents_range[0]} ${role.name} agent${
                          role.num_agents_range[0] > 1 ? 's' : ''
                        }`
                      );
                      setCreatingScene(false);
                      creatingSceneRef.current = false;
                      return;
                    }
                  }
                  const sceneConfig = merge({}, DefaultSceneInfoConfig, sceneForm.values);
                  let evaluatorConfig: EvaluatorConfig[] | null = null;
                  if (evaluationMethod === 'evaluators') {
                    evaluatorConfig = [];
                    Object.entries(evaluatorForm.values)
                      .filter((entry) => entry[0] !== 'evaluation_method')
                      .forEach(([name, config]) => {
                        evaluatorConfig?.push({
                          evaluator_name: name,
                          evaluator_config_data: config as EvaluatorConfigData,
                        });
                      });
                  }
                  const roleConfig: Record<string, SceneRoleConfig> = {};
                  scene.scene_metadata.scene_definition.roles.forEach((role) => {
                    const actionsConfig: Record<string, ActionConfig> = {};
                    role.actions.forEach((action) => {
                      const metricsConfig: Record<string, MetricConfig> = {};
                      action.metrics?.forEach((metric) => {
                        metricsConfig[metric.name] = {
                          enable: true,
                        };
                      });
                      actionsConfig[action.name] = {
                        metrics_config: metricsConfig,
                      };
                    });
                    roleConfig[role.name] = {
                      actions_config: actionsConfig,
                      agents_config: roleAgentConfigsMap[role.name],
                    };
                  });
                  const createSceneParams: CreateSceneParams = {
                    scene_obj_config: {
                      scene_obj: scene.scene_metadata.obj_for_import,
                      scene_config_data: {
                        ...sceneConfig,
                        roles_config: roleConfig,
                      },
                    },
                    metric_evaluator_objs_config: {
                      evaluators: [],
                    },
                  };
                  const { task_id, save_dir } = await ServerAPI.sceneTask.createSceneTask(createSceneParams);
                  await LocalAPI.taskBundle.webui.save(save_dir, task_id, scene, createSceneParams);
                  globalStore.updateInfoAfterSceneTaskCreated(save_dir, task_id, scene, createSceneParams);
                  router.push(`/processing/${task_id}?bundlePath=${encodeURIComponent(save_dir)}`);
                } catch (e) {
                  console.error(e);
                  message.error('Create scene task failed.');
                  setCreatingScene(false);
                  creatingSceneRef.current = false;
                }
              }}
            >
              Start
            </Button>
          </Space>
        </Footer>
        {hasHistory && (
          <div
            className="historyButton"
            onClick={() => {
              setTaskHistoryModalOpen(true);
            }}
          >
            <MdOutlineHistory size={'1em'} />
          </div>
        )}
      </Container>
      <TaskHistoryModal
        open={taskHistoryModalOpen}
        scene={scene}
        tasks={taskHistory}
        onApplyHistoryTaskConfig={(createSceneParams) => {
          const {sceneFormValues, roleAgentConfigsMap} = splitCreateSceneParamsToState(createSceneParams)
          sceneForm.setValues(sceneFormValues);
          try {
            sceneForm.validate();
          } catch {}
          setRoleAgentConfigsMap(roleAgentConfigsMap);
          setTaskHistoryModalOpen(false);
        }}
        onNeedClose={() => {
          setTaskHistoryModalOpen(false);
        }}
      />
      <SelectAgentModal
        open={selectAgentModalOpen}
        selectableAgentsMetadata={operatingRoleName ? scene.agents_metadata[operatingRoleName] : []}
        onSubmit={(agentMetadata) => {
          setOperatingAgentMetadata(agentMetadata);
          setSelectAgentModalOpen(false);
          setCreateOrUpdateAgentModalOpen(true);
        }}
        onNeedClose={() => {
          setSelectAgentModalOpen(false);
        }}
      />
      <CreateOrUpdateAgentModal
        open={createOrUpdateAgentModalOpen}
        sceneAgentConfig={
          operatingRoleName && operatingAgent ? roleAgentConfigsMap[operatingRoleName][operatingAgent.index] : undefined
        }
        operatingAgentMetadata={operatingAgentMetadata}
        otherAgentColors={Object.entries(roleAgentConfigsMap).reduce((total, [key, agents]) => {
          return [...total, ...agents.map((agent) => agent.config_data.chart_major_color!)];
        }, [] as string[])}
        onSubmit={(agentConfig) => {
          if (!operatingRoleName) return;
          if (operatingAgent) {
            const newRoleAgentConfigsMap = { ...roleAgentConfigsMap };
            newRoleAgentConfigsMap[operatingRoleName][operatingAgent.index] = agentConfig;
            setRoleAgentConfigsMap(newRoleAgentConfigsMap);
          } else {
            const newRoleAgentConfigsMap = { ...roleAgentConfigsMap };
            let roleAgentConfigs = newRoleAgentConfigsMap[operatingRoleName];
            if (!roleAgentConfigs) {
              roleAgentConfigs = [];
              newRoleAgentConfigsMap[operatingRoleName] = roleAgentConfigs;
            }
            newRoleAgentConfigsMap[operatingRoleName] = [...roleAgentConfigs, agentConfig];
            setRoleAgentConfigsMap(newRoleAgentConfigsMap);
          }
          setOperatingRoleName(undefined);
          setOperatingAgentMetadata(undefined);
          setOperatingAgent(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
        onNeedClose={() => {
          setOperatingRoleName(undefined);
          setOperatingAgentMetadata(undefined);
          setOperatingAgent(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
      />
    </>
  );
};

export default SceneConfigBoard;
