'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneParams, getRoleAgentConfigsMapFromCreateSceneParams } from '@/types/server/CreateSceneParams';
import DynamicObject from '@/types/server/DynamicObject';
import { SceneActionConfig } from '@/types/server/config/Action';
import SceneAgentConfig from '@/types/server/config/Agent';
import { MetricEvaluatorObjConfig } from '@/types/server/config/Evaluator';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneRoleConfig } from '@/types/server/config/Role';
import { SceneConfigData } from '@/types/server/config/Scene';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import EvaluatorMetadata from '@/types/server/meta/Evaluator';
import Scene from '@/types/server/meta/Scene';
import ServerInfo from '@/types/server/meta/ServerInfo';
import { WebUIRoleMetricConfig, getWebUIMetricsConfigFromCreateSceneParams } from '@/types/webui/MetricConfig';
import { Button, Card, Collapse, Flex, Space, message } from 'antd';
import { useTheme } from 'antd-style';
import { Form, Switch } from '@formily/antd-v5';
import { createForm, onFormValidateFailed, onFormValidateSuccess, onFormValuesChange } from '@formily/core';
import styled from '@emotion/styled';
import merge from 'lodash/merge';
import { MdOutlineHistory } from 'react-icons/md';
import AgentCard from '@/components/agent/AgentCard';
import CreateOrUpdateAgentModal from '@/components/agent/CreateOrUpdateAgentModal';
import SelectAgentModal from '@/components/agent/SelectAgentModal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EvaluatorCard from '@/components/evaluator/EvaluatorCard';
import EvaluatorConfigModal from '@/components/evaluator/EvaluatorConfigModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import SceneRoleConfigCard from '@/components/homepage/SceneConfigBoard/SceneRoleConfigCard';
import TaskHistoryModal from '@/components/task/TaskHistoryModal';
import { DefaultSceneInfoConfig } from '@/models/scene';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';

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

const CollapseItemTitle = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;

  .info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .title {
      font-size: 15px;
      line-height: 22px;
      font-weight: 500;
    }

    .desc {
      font-size: 13px !important;
      font-weight: normal;
    }
  }

  .extra {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-right: 12px;
    font-size: 14px;
  }
`;

interface SceneConfigBoardProps {
  scene: Scene;
  taskHistory: WebUITaskBundleTaskInfo[];
  serverInfo: ServerInfo;
}

function splitCreateSceneParamsToState(
  scene: Scene,
  createSceneParams: CreateSceneParams
): {
  sceneFormValues: any;
  roleAgentConfigsMap: Record<string, SceneAgentConfig[]>;
  webUIMetricsConfig: Record<string, WebUIRoleMetricConfig>;
} {
  const roleAgentConfigsMap = getRoleAgentConfigsMapFromCreateSceneParams(createSceneParams);
  const webUIMetricsConfig = getWebUIMetricsConfigFromCreateSceneParams(scene, createSceneParams);
  const sceneFormValues: Partial<SceneConfigData> = createSceneParams.scene_obj_config.scene_config_data;
  delete sceneFormValues.roles_config;
  return {
    sceneFormValues,
    roleAgentConfigsMap,
    webUIMetricsConfig,
  };
}

const SceneConfigBoard = ({ scene, serverInfo, taskHistory }: SceneConfigBoardProps) => {
  const router = useRouter();
  const theme = useTheme();
  const globalStore = useGlobalStore();

  const hasHistory = taskHistory.length > 0;
  const [taskHistoryModalOpen, setTaskHistoryModalOpen] = useState(false);

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

  const [operatingRoleName, setOperatingRoleName] = useState<string>();
  const [selectAgentModalOpen, setSelectAgentModalOpen] = useState(false);
  const [roleAgentConfigsMap, setRoleAgentConfigsMap] = useState<Record<string, SceneAgentConfig[]>>({});
  const [operatingAgentMetadata, setOperatingAgentMetadata] = useState<SceneAgentMetadata>();
  const [operatingAgent, setOperatingAgent] = useState<{
    index: number;
    agent: SceneAgentConfig;
  }>();
  const [createOrUpdateAgentModalOpen, setCreateOrUpdateAgentModalOpen] = useState(false);
  const checkIsAgentsConfigPass = (showErrorMessage = false) => {
    const noStaticRoles = scene.scene_metadata.scene_definition.roles.filter((r) => !r.is_static);
    for (let i = 0; i < noStaticRoles.length; i++) {
      const role = noStaticRoles[i];
      const roleAgentConfigs = roleAgentConfigsMap[role.name] || [];
      if (role.num_agents_range[0] > 0 && roleAgentConfigs.length < role.num_agents_range[0]) {
        if (showErrorMessage) {
          message.error(
            `At least ${role.num_agents_range[0]} ${role.name} agent${role.num_agents_range[0] > 1 ? 's' : ''}`
          );
        }
        return false;
      }
    }
    return true;
  };
  const agentsConfigValid = useMemo(() => {
    return checkIsAgentsConfigPass();
  }, [roleAgentConfigsMap]);

  const [webUIMetricsConfig, setWebUIMetricsConfig] = useState<Record<string, WebUIRoleMetricConfig>>({});
  const hasMetricEvaluators = (scene.evaluators_metadata || []).length > 0;
  const [useMetricEvaluators, setUseMetricEvaluators] = useState<boolean>(false);
  const [evaluatorConfigMap, setEvaluatorConfigMap] = useState<Record<string, MetricEvaluatorObjConfig>>({});
  const [enabledEvaluatorNames, setEnabledEvaluatorNames] = useState<string[]>([]);
  const [highlightMetrics, setHighlightMetrics] = useState<string[]>([]);
  const { allMetrics, checkedMetrics } = useMemo(() => {
    const allMetrics: string[] = [];
    const checkedMetrics: string[] = [];
    scene.scene_metadata.scene_definition.roles.forEach((roleMetadata) => {
      roleMetadata.actions.forEach((action) => {
        action.metrics?.forEach((metric) => {
          const metricKey = `${roleMetadata.name}.${action.name}.${metric.name}`;
          allMetrics.push(metricKey);
          if (webUIMetricsConfig[roleMetadata.name]?.actions_config[action.name]?.metrics_config[metric.name]?.enable) {
            checkedMetrics.push(metricKey);
          }
        });
      });
    });
    if (checkedMetrics.length === 0) {
      setEnabledEvaluatorNames([]);
    }
    return { allMetrics, checkedMetrics };
  }, [scene, webUIMetricsConfig]);
  const usefulEvaluators = useMemo(() => {
    return scene.evaluators_metadata.filter((evaluatorMetadata) => {
      return evaluatorMetadata.metrics.some((m) => checkedMetrics.includes(m));
    });
  }, [scene.evaluators_metadata, checkedMetrics]);
  const [evaluatorConfigModalOpen, setEvaluatorConfigModalOpen] = useState(false);
  const [evaluatorConfigModalData, setEvaluatorConfigModalData] = useState<{
    metadata: EvaluatorMetadata;
    config?: MetricEvaluatorObjConfig;
  }>();

  useEffect(() => {
    const doFistFormValidate = async () => {
      try {
        await sceneForm.validate();
        setSceneFormValid(true);
      } catch {
        sceneForm.clearErrors();
        setSceneFormValid(false);
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
                      fontSize: 16,
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
                          forceRender: true,
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
              title={
                <Flex align={'center'}>
                  <div className={`validate-status-indicator ${agentsConfigValid ? 'valid' : ''}`} />
                  <div
                    style={{
                      marginLeft: 8,
                      fontSize: 16,
                    }}
                  >
                    Agent List
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
            {allMetrics.length > 0 && (
              <Card
                title={
                  <Flex align={'center'}>
                    <div className={`validate-status-indicator valid`} />
                    <div
                      style={{
                        marginLeft: 8,
                        fontSize: 16,
                      }}
                    >
                      Evaluation
                    </div>
                  </Flex>
                }
                headStyle={{
                  padding: '0 15px',
                  fontSize: 16,
                }}
                bodyStyle={{
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                <CustomCollapseWrapper>
                  <Collapse
                    defaultActiveKey={['metrics', 'evaluator']}
                    items={[
                      {
                        key: 'metrics',
                        label: (
                          <CollapseItemTitle>
                            <div className="info">
                              <div className="title">Metrics</div>
                              <div className="desc">
                                You can choose whether or not you want to evaluate that metric in this test
                              </div>
                            </div>
                            {hasMetricEvaluators && (
                              <div className="extra" onClick={(e) => e.stopPropagation()}>
                                <Space
                                  size={4}
                                  style={
                                    checkedMetrics.length === 0
                                      ? {
                                          cursor: 'not-allowed',
                                          color: theme.colorTextDisabled,
                                        }
                                      : {
                                          cursor: 'pointer',
                                        }
                                  }
                                  onClick={() => {
                                    if (checkedMetrics.length > 0) {
                                      setUseMetricEvaluators(!useMetricEvaluators);
                                    }
                                  }}
                                >
                                  <Switch
                                    size="small"
                                    disabled={checkedMetrics.length === 0}
                                    checked={useMetricEvaluators && checkedMetrics.length > 0}
                                    style={{
                                      pointerEvents: 'none',
                                    }}
                                  />
                                  Enable Evaluator
                                </Space>
                              </div>
                            )}
                          </CollapseItemTitle>
                        ),
                        children: (
                          <Flex vertical align={'stretch'} gap={10}>
                            {scene.scene_metadata.scene_definition.roles
                              .filter(
                                (r) => (r.actions || []).reduce((acc, a) => acc + (a.metrics || []).length, 0) > 0
                              )
                              .map((r, index) => {
                                return (
                                  <SceneRoleConfigCard
                                    key={index}
                                    roleMetadata={r}
                                    config={webUIMetricsConfig[r.name]}
                                    highlightMetrics={highlightMetrics}
                                    evaluatorHandledMetrics={
                                      useMetricEvaluators
                                        ? usefulEvaluators
                                            .filter((e) => enabledEvaluatorNames.includes(e.cls_name))
                                            .map((e) => e.metrics)
                                            .flat()
                                        : []
                                    }
                                    onConfigChange={(newRoleConfig) => {
                                      const newMetricsConfig = { ...webUIMetricsConfig };
                                      newMetricsConfig[r.name] = newRoleConfig;
                                      setWebUIMetricsConfig(newMetricsConfig);
                                    }}
                                  />
                                );
                              })}
                          </Flex>
                        ),
                      },
                      ...(useMetricEvaluators && checkedMetrics.length > 0
                        ? [
                            {
                              key: 'evaluator',

                              label: (
                                <CollapseItemTitle>
                                  <div className="info">
                                    <div className="title">Evaluator</div>
                                    <div className="desc">
                                      You can enable more than one evaluator and the evaluation tasks will be performed
                                      sequentially, only the last evaluation result will be retained for the metrics
                                      that have been evaluated multiple times, and you can drag the evaluators to adjust
                                      their order
                                    </div>
                                  </div>
                                </CollapseItemTitle>
                              ),
                              children: (
                                <Space wrap={true}>
                                  {usefulEvaluators.map((evaluator, index) => {
                                    const enabled = enabledEvaluatorNames.includes(evaluator.cls_name);
                                    return (
                                      <EvaluatorCard
                                        key={index}
                                        metadata={evaluator}
                                        config={evaluatorConfigMap[evaluator.cls_name]}
                                        enable={enabled}
                                        onHover={() => {
                                          setHighlightMetrics(evaluator.metrics);
                                        }}
                                        onHoverLeave={() => {
                                          setHighlightMetrics([]);
                                        }}
                                        onEnable={(metadata, config) => {
                                          if (config) {
                                            setEvaluatorConfigMap((prev) => {
                                              const newConfigMap = { ...prev };
                                              newConfigMap[evaluator.cls_name] = config;
                                              return newConfigMap;
                                            });
                                            setEnabledEvaluatorNames([...enabledEvaluatorNames, evaluator.cls_name]);
                                          } else {
                                            setEvaluatorConfigModalData({
                                              metadata: metadata,
                                            });
                                            setEvaluatorConfigModalOpen(true);
                                          }
                                        }}
                                        onDisable={() => {
                                          setEnabledEvaluatorNames(
                                            enabledEvaluatorNames.filter((n) => n !== evaluator.cls_name)
                                          );
                                        }}
                                        onEditConfig={(metadata, config) => {
                                          setEvaluatorConfigModalData({
                                            metadata: metadata,
                                            config: config,
                                          });
                                          setEvaluatorConfigModalOpen(true);
                                        }}
                                      />
                                    );
                                  })}
                                </Space>
                              ),
                            },
                          ]
                        : []),
                    ]}
                  />
                </CustomCollapseWrapper>
              </Card>
            )}
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
                setRoleAgentConfigsMap({});
                setWebUIMetricsConfig({});
                setEvaluatorConfigMap({});
                setEnabledEvaluatorNames([]);
                setUseMetricEvaluators(false);
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
                  const agentsConfigValid = checkIsAgentsConfigPass(true);
                  if (!agentsConfigValid) {
                    setCreatingScene(false);
                    creatingSceneRef.current = false;
                    return;
                  }
                  const sceneConfig = merge({}, DefaultSceneInfoConfig, sceneForm.values);
                  const roleConfig: Record<string, SceneRoleConfig> = {};
                  const enabledMetrics: string[] = [];
                  scene.scene_metadata.scene_definition.roles.forEach((role) => {
                    const actionsConfig: Record<string, SceneActionConfig> = {};
                    role.actions.forEach((action) => {
                      const metricsConfig: Record<string, SceneMetricConfig> = {};
                      action.metrics?.forEach((metric) => {
                        metricsConfig[metric.name] = {
                          enable:
                            webUIMetricsConfig[role.name]?.actions_config[action.name]?.metrics_config[metric.name]
                              ?.enable || false,
                        };
                        enabledMetrics.push(`${role.name}.${action.name}.${metric.name}`);
                      });
                      actionsConfig[action.name] = {
                        metrics_config: Object.keys(metricsConfig).length > 0 ? metricsConfig : null,
                      };
                    });
                    roleConfig[role.name] = {
                      actions_config: actionsConfig,
                      agents_config: roleAgentConfigsMap[role.name],
                    };
                  });
                  let hasHumanAgent = false;
                  Object.entries(roleAgentConfigsMap).forEach(([roleName, agentsConfig]) => {
                    agentsConfig.forEach((agentConfig) => {
                      const agentMeta = scene.agents_metadata[roleName].find(
                        (agent) => agent.obj_for_import.obj === agentConfig.obj_for_import.obj
                      );
                      if (agentMeta?.is_human) {
                        hasHumanAgent = true;
                      }
                    });
                  });
                  const evaluators = useMetricEvaluators
                    ? Object.keys(evaluatorConfigMap)
                        .filter((evaluatorClsName) => enabledEvaluatorNames.includes(evaluatorClsName))
                        .map((evaluatorClsName) => {
                          return evaluatorConfigMap[evaluatorClsName];
                        })
                    : [];
                  const charts: DynamicObject[] = [];
                  scene.charts_metadata?.forEach((chartMetadata) => {
                    if (chartMetadata.supported_metric_names.some((m) => enabledMetrics.includes(m))) {
                      charts.push(chartMetadata.obj_for_import);
                    }
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
                      evaluators,
                    },
                    reporter_obj_config: {
                      charts: charts,
                    },
                    work_dir: scene.work_dir,
                  };
                  const { id: task_id, host, port } = await ServerAPI.sceneTask.createSceneTask(createSceneParams);
                  const save_dir = await LocalAPI.path.join(serverInfo.paths.result_dir, task_id);
                  const serverUrl = `${window.location.protocol}//${host}:${port}`;
                  await LocalAPI.taskBundle.webui.save(save_dir, task_id, serverUrl, scene, createSceneParams);
                  globalStore.updateInfoAfterSceneTaskCreated(save_dir, task_id, scene, createSceneParams);
                  let serverAccessible = false;
                  while (!serverAccessible) {
                    try {
                      await new Promise((resolve) => {
                        setTimeout(() => {
                          resolve(null);
                        }, 1000);
                      });
                      await ServerAPI.sceneTask.getAgentConnectedStatus(serverUrl);
                      serverAccessible = true;
                    } catch {
                      console.info('Server not ready, retrying...');
                    }
                  }
                  if (hasHumanAgent) {
                    const localIP = await LocalAPI.network.getLocalIP();
                    const hostBaseUrl = `${window.location.protocol}//${localIP}:${window.location.port}`;
                    router.push(
                      `/prepare/${task_id}?serverUrl=${encodeURIComponent(serverUrl)}&bundlePath=${encodeURIComponent(
                        save_dir
                      )}&hostBaseUrl=${encodeURIComponent(hostBaseUrl)}`
                    );
                  } else {
                    router.push(
                      `/processing/${task_id}?serverUrl=${encodeURIComponent(
                        serverUrl
                      )}&bundlePath=${encodeURIComponent(save_dir)}`
                    );
                  }
                } catch (e) {
                  console.error(e);
                  message.error('Create scene task failed.');
                  setCreatingScene(false);
                  creatingSceneRef.current = false;
                }
              }}
            >
              Create Task
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
          const { sceneFormValues, roleAgentConfigsMap, webUIMetricsConfig } = splitCreateSceneParamsToState(
            scene,
            createSceneParams
          );
          sceneForm.setValues(sceneFormValues);
          try {
            sceneForm.validate();
          } catch {}
          setRoleAgentConfigsMap(roleAgentConfigsMap);
          setWebUIMetricsConfig(webUIMetricsConfig);
          setTaskHistoryModalOpen(false);
          if (createSceneParams.metric_evaluator_objs_config.evaluators.length > 0) {
            setUseMetricEvaluators(true);
            setEvaluatorConfigMap(
              createSceneParams.metric_evaluator_objs_config.evaluators.reduce(
                (total, evaluator) => {
                  total[evaluator.evaluator_obj.obj] = evaluator;
                  return total;
                },
                {} as Record<string, MetricEvaluatorObjConfig>
              )
            );
            setEnabledEvaluatorNames(
              createSceneParams.metric_evaluator_objs_config.evaluators.map((e) => e.evaluator_obj.obj)
            );
          } else {
            setUseMetricEvaluators(false);
            setEvaluatorConfigMap({});
            setEnabledEvaluatorNames([]);
          }
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
        allAgentNames={Object.entries(roleAgentConfigsMap).reduce((total, [key, agents]) => {
          return [...total, ...agents.map((agent) => agent.config_data.profile.name)];
        }, [] as string[])}
        allAgentColors={Object.entries(roleAgentConfigsMap).reduce((total, [key, agents]) => {
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
      <EvaluatorConfigModal
        open={evaluatorConfigModalOpen}
        metadata={evaluatorConfigModalData?.metadata}
        config={evaluatorConfigModalData?.config}
        onSubmit={(metadata, config) => {
          setEvaluatorConfigMap((prev) => {
            return {
              ...prev,
              [metadata.cls_name]: config,
            };
          });
          setEnabledEvaluatorNames((prev) => {
            return Array.from(new Set([...prev, metadata.cls_name]));
          });
          setEvaluatorConfigModalOpen(false);
          setEvaluatorConfigModalData(undefined);
        }}
        onNeedClose={() => {
          setEvaluatorConfigModalOpen(false);
          setEvaluatorConfigModalData(undefined);
        }}
      />
    </>
  );
};

export default SceneConfigBoard;
