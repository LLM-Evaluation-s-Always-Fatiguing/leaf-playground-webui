'use client';

import Scene from '@/types/server/Scene';
import styled from '@emotion/styled';
import { Button, Card, Collapse, message, Space } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm, onFormValuesChange, onFormValidateSuccess, onFormValidateFailed } from '@formily/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SelectAgentModal from '@/components/agent/SelectAgentModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import CreateOrUpdateAgentModal from '@/components/agent/CreateOrUpdateAgentModal';
import SceneAgentConfig, { SceneAgentDefinition } from '@/types/server/Agent';
import AgentCard from '@/components/agent/AgentCard';
import { useRouter } from 'next/navigation';
import merge from 'lodash/merge';
import { DefaultSceneInfoConfig } from '@/models/scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import useGlobalStore from '@/stores/global';
import ServerAPI from '@/services/server';
import EvaluatorConfig, { EvaluatorConfigData } from '@/types/server/Evaluator';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { MdOutlineHistory } from 'react-icons/md';
import TaskHistoryModal from '@/components/task/TaskHistoryModal';
import LocalAPI from '@/services/local';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useTheme } from 'antd-style';

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
      border-color: ${props => props.theme.colorBorderSecondary};

      .ant-collapse-header {
        flex-direction: row-reverse !important;
        align-items: center !important;

        .ant-collapse-header-text + .ant-collapse-extra {
          margin-right: 8px;
        }

        .ant-collapse-extra {
          .validate-status-indicator {
            width: 1em;
            height: 1em;
            border-radius: 50%;
            background-color: ${(props) => props.theme.colorError};
          }

          .validate-status-indicator.valid {
            background-color: ${(props) => props.theme.colorSuccess};
          }
        }
      }

      .ant-collapse-content {
        border-color: ${props => props.theme.colorBorderSecondary};
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

const SceneConfigBoard = ({ scene, taskHistory }: SceneConfigBoardProps) => {
  const router = useRouter();
  const theme = useTheme();
  const globalStore = useGlobalStore();

  const hasHistory = taskHistory.length > 0;

  const creatingSceneRef = useRef(false);
  const [creatingScene, setCreatingScene] = useState(false);

  const [sceneFormValid, setSceneFormValid] = useState(false);
  const sceneForm = useMemo(() => {
    return createForm({
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

  const [sceneAdditionalFormValid, setSceneAdditionalFormValid] = useState(false);
  const sceneAdditionalForm = useMemo(() => {
    return createForm({
      effects() {
        onFormValuesChange((form) => {
          form.validate();
        });
        onFormValidateSuccess(() => {
          setSceneAdditionalFormValid(true);
        });
        onFormValidateFailed(() => {
          setSceneAdditionalFormValid(false);
        });
      },
    });
  }, []);

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

  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [sceneAgentConfigs, setSceneAgentConfigs] = useState<SceneAgentConfig[]>([]);
  const [operatingAgentDefinition, setOperatingAgentDefinition] = useState<SceneAgentDefinition>();
  const [operatingAgentConfigIndex, setOperatingAgentConfigIndex] = useState(-1);
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);
  const [taskHistoryModalOpen, setTaskHistoryModalOpen] = useState(false);

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
        await sceneAdditionalForm.validate();
        setSceneAdditionalFormValid(true);
      } catch {
        sceneAdditionalForm.clearErrors();
        setSceneAdditionalFormValid(false);
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
              title={'Scene Parameters'}
              bodyStyle={{
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <CustomCollapseWrapper>
                <Collapse
                  defaultActiveKey={['basic', 'additional', 'evaluation']}
                  items={[
                    {
                      key: 'basic',
                      label: 'Basic',
                      extra: <div className={`validate-status-indicator ${sceneFormValid ? 'valid' : ''}`} />,
                      children: (
                        <Form form={sceneForm} labelCol={5} wrapperCol={16}>
                          <FormilyDefaultSchemaField schema={scene.sceneInfoConfigFormilySchema} />
                        </Form>
                      ),
                    },
                    {
                      key: 'additional',
                      label: 'Additional',
                      extra: <div className={`validate-status-indicator ${sceneAdditionalFormValid ? 'valid' : ''}`} />,
                      children: (
                        <Form form={sceneAdditionalForm} labelCol={5} wrapperCol={16}>
                          <FormilyDefaultSchemaField schema={scene.additionalConfigFormilySchema} />
                        </Form>
                      ),
                    },
                    ...(scene.evaluatorsConfigFormilySchemas
                      ? [
                          {
                            key: 'evaluation',
                            label: 'Evaluation',
                            extra: <div className={`validate-status-indicator ${evaluatorFormValid ? 'valid' : ''}`} />,
                            children: (
                              <Form form={evaluatorForm} labelCol={5} wrapperCol={16}>
                                <FormilyDefaultSchemaField>
                                  <FormilyDefaultSchemaField.Markup
                                    title={'Evaluation method'}
                                    name={'evaluation_method'}
                                    x-decorator="FormItem"
                                    x-component="Radio.Group"
                                    default={'evaluators'}
                                    enum={[
                                      { label: 'Only Human', value: 'human' },
                                      { label: 'With LLM', value: 'evaluators' },
                                    ]}
                                  />
                                </FormilyDefaultSchemaField>
                                {evaluationMethod === 'evaluators' && (
                                  <FormilyDefaultSchemaField schema={scene.evaluatorsConfigFormilySchemas} />
                                )}
                              </Form>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              </CustomCollapseWrapper>
            </Card>
            <Card title={`Agent List (At least ${scene.min_agents_num} agent${scene.min_agents_num > 1 ? 's' : ''})`}>
              <Space wrap={true}>
                {(scene.max_agents_num <= 0 || sceneAgentConfigs.length <= scene.max_agents_num) && (
                  <AgentCard
                    role={'add'}
                    agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
                    onAddNewClick={() => {
                      setSelectAgentModalOpen(true);
                    }}
                  />
                )}
                {sceneAgentConfigs.map((agentConfig, index) => {
                  return (
                    <AgentCard
                      key={index}
                      role={'agent'}
                      agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
                      sceneAgentConfig={agentConfig}
                      onEditButtonClick={() => {
                        setOperatingAgentConfigIndex(index);
                        setOperatingAgentDefinition({
                          agent_id: agentConfig.agent_id,
                          name: scene.agentsConfigFormilySchemas[agentConfig.agent_id].title,
                          schema: scene.agentsConfigFormilySchemas[agentConfig.agent_id],
                        });
                        setCreateOrUpdateAgentModalOpen(true);
                      }}
                      onDeleteButtonClick={() => {
                        const newSceneAgentConfigs = [...sceneAgentConfigs];
                        newSceneAgentConfigs.splice(index, 1);
                        setSceneAgentConfigs(newSceneAgentConfigs);
                      }}
                    />
                  );
                })}
              </Space>
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
                await sceneAdditionalForm.reset();
                await evaluatorForm.reset();
                setSceneAgentConfigs([]);
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
                  await sceneAdditionalForm.validate();
                  await evaluatorForm.validate();
                  if (sceneAgentConfigs.length < scene.min_agents_num) {
                    message.error(
                      `At least ${scene.min_agents_num} agent${scene.min_agents_num > 1 ? 's' : ''} are required.`
                    );
                    creatingSceneRef.current = false;
                    setCreatingScene(false);
                    return;
                  }
                  const sceneConfig = merge({}, DefaultSceneInfoConfig, sceneForm.values);
                  const additionalConfig = sceneAdditionalForm.values;
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
                  const finalConfig: RunSceneConfig = {
                    id: scene.id,
                    scene_info_config_data: sceneConfig,
                    scene_agents_config_data: sceneAgentConfigs,
                    additional_config_data: additionalConfig,
                    scene_evaluators_config_data: evaluatorConfig,
                  };
                  const { task_id, save_dir, agent_configs } = await ServerAPI.sceneTask.createSceneTask(finalConfig);
                  await LocalAPI.taskBundle.webui.save(save_dir, task_id, scene, finalConfig, agent_configs);
                  globalStore.updateInfoAfterSceneTaskCreated(save_dir, task_id, scene, finalConfig, agent_configs);
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
      <SelectAgentModal
        open={selectAgentModalOpen}
        agentsConfigFormilySchemas={scene.agentsConfigFormilySchemas}
        onSubmit={(agentDefinition) => {
          setOperatingAgentDefinition(agentDefinition);
          setSelectAgentModalOpen(false);
          setCreateOrUpdateAgentModalOpen(true);
        }}
        onNeedClose={() => {
          setSelectAgentModalOpen(false);
        }}
      />
      <CreateOrUpdateAgentModal
        open={createOrUpdateAgentModalOpen}
        sceneAgentConfig={operatingAgentConfigIndex >= 0 ? sceneAgentConfigs[operatingAgentConfigIndex] : undefined}
        sceneAgentDefinition={operatingAgentDefinition}
        otherAgentConfigs={sceneAgentConfigs}
        onSubmit={(agentConfig) => {
          if (operatingAgentConfigIndex >= 0) {
            const newSceneAgentConfigs = [...sceneAgentConfigs];
            newSceneAgentConfigs[operatingAgentConfigIndex] = agentConfig;
            setSceneAgentConfigs(newSceneAgentConfigs);
          } else {
            setSceneAgentConfigs([...sceneAgentConfigs, agentConfig]);
          }
          setOperatingAgentConfigIndex(-1);
          setOperatingAgentDefinition(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
        onNeedClose={() => {
          setOperatingAgentConfigIndex(-1);
          setOperatingAgentDefinition(undefined);
          setCreateOrUpdateAgentModalOpen(false);
        }}
      />
      <TaskHistoryModal
        open={taskHistoryModalOpen}
        scene={scene}
        tasks={taskHistory}
        onApplyHistoryTaskConfig={(runConfig) => {
          sceneForm.setValues(runConfig.scene_info_config_data);
          sceneAdditionalForm.setValues(runConfig.additional_config_data);
          try {
            sceneForm.validate();
            sceneAdditionalForm.validate();
          } catch {}
          if (runConfig.scene_evaluators_config_data) {
            evaluatorForm.setValues(
              runConfig.scene_evaluators_config_data.reduce(
                (acc, evaluator) => {
                  acc[evaluator.evaluator_name] = evaluator.evaluator_config_data;
                  return acc;
                },
                {} as Record<string, EvaluatorConfigData>
              )
            );
          }
          setSceneAgentConfigs(runConfig.scene_agents_config_data);
          setTaskHistoryModalOpen(false);
        }}
        onNeedClose={() => {
          setTaskHistoryModalOpen(false);
        }}
      />
    </>
  );
};

export default SceneConfigBoard;
