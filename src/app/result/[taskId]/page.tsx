'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SceneActionLog, SceneLogType } from '@/types/server/common/Log';
import { getRoleAgentConfigsMapFromCreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneMetricConfig } from '@/types/server/config/Metric';
import { SceneMetricDefinition } from '@/types/server/meta/Scene';
import SceneTaskResultBundle from '@/types/server/task/result-bundle';
import { Badge, Button, ButtonProps, Card, Collapse, Descriptions, Modal, Space, Table, Tooltip, message } from 'antd';
import { useTheme } from 'antd-style';
import { Switch } from '@formily/antd-v5';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import flatten from 'lodash/flatten';
import keyBy from 'lodash/keyBy';
import { MdEditNote } from 'react-icons/md';
import { TbCodeDots } from 'react-icons/tb';
import AgentCard from '@/components/agent/AgentCard';
import LoadingOverlay from '@/components/loading/LoadingOverlay';
import JSONViewModal from '@/components/modals/JSONViewModal';
import LogMetricDetailModal from '@/components/modals/LogMetricDetailModal';
import VegaChart from '@/components/vega/VegaChart';
import { EvaluatorMark } from '@/app/homepage/components/icons/EvaluatorMark';
import { HumanMetricMark } from '@/app/processing/components/common/icons/HumanMetricMark';
import ResultReportComponentWithExtraProps from '@/app/result/components/common/ReportComponentWithExtraProps';
import { DefaultResultReportComponentProps } from '@/app/result/components/def';
import WhoIsTheSpyCNDefaultReport from '@/app/result/components/specialized/who-is-the-spy-cn/DefaultReport';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import useGlobalStore from '@/stores/global';
import {
  getSceneActionLogMetricEvalRecordDisplayInfo,
  getSceneActionLogMetricInfo,
  getSceneLogMessageDisplayContent,
} from '@/utils/scene-log';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding-bottom: 75px;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 12px 16px;
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

const jsonCodeButtonCommonProps: ButtonProps = {
  size: 'small',
  type: 'text',
  style: {
    fontSize: '18px',
    lineHeight: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: <TbCodeDots size={'1em'} />,
};

const SampleAgentComponent = ({ name, color }: { name: string; color?: string | undefined }) => {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {color && (
        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            backgroundColor: color,
            width: '10px',
            height: '10px',
            margin: '2px 0px',
            borderRadius: '50%',
            flexShrink: 0,
            zIndex: 2,
          }}
        />
      )}
      <div
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1,
          fontSize: 14,
          ...(color ? { textIndent: '14px' } : {}),
        }}
      >
        {name}
      </div>
    </div>
  );
};

const LogMetricArea = styled.div`
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    font-weight: 500;
  }

  .metrics {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .metric {
      min-width: calc(100% / 4 - 6px);
      margin-right: 6px;
      margin-bottom: 3px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      pointer-events: auto;

      .label {
        font-weight: 500;
      }

      .value {
        margin-left: 6px;
      }

      .reason {
        margin-left: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;

const Footer = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 55px;
  z-index: 100;
  background: ${(props) => props.theme.colorBgLayout};
  border-top: 1px solid ${(props) => props.theme.colorBorder};
  box-shadow: ${(props) => props.theme.boxShadow};

  padding: ${(props) => props.theme.padding}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const taskId = params.taskId;

  const theme = useTheme();
  const globalStore = useGlobalStore();

  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState<string>('Loading...');
  const [taskServerAlive, setTaskServerAlive] = useState<boolean>(false);
  const scene = useMemo(() => {
    return globalStore.currentProject?.metadata;
  }, [globalStore.currentProject]);
  const createSceneTaskParams = useMemo(() => {
    return globalStore.createSceneTaskParams;
  }, [globalStore.createSceneTaskParams]);
  const [serverBundle, setServerBundle] = useState<SceneTaskResultBundle>();
  const actionLogs = useMemo(() => {
    return (serverBundle?.logs || []).filter((l) => l.log_type === SceneLogType.ACTION) as SceneActionLog[];
  }, [serverBundle?.logs]);
  const [showLogsMetrics, setShowLogsMetrics] = useState<boolean>(false);
  const roleAgentConfigMap = useMemo(() => {
    if (globalStore.createSceneTaskParams) {
      return getRoleAgentConfigsMapFromCreateSceneTaskParams(globalStore.createSceneTaskParams);
    }
    return {};
  }, [globalStore.createSceneTaskParams]);
  const agentConfigMap = useMemo(() => {
    return keyBy(
      flatten(
        Object.keys(roleAgentConfigMap).map((key) => {
          return roleAgentConfigMap[key];
        })
      ),
      (a) => a.config_data.profile.id
    );
  }, [roleAgentConfigMap]);
  const [viewingJSON, setViewingJSON] = useState<any>();
  const [viewingLog, setViewingLog] = useState<SceneActionLog>();
  const [jsonViewerModalTitle, setJSONViewerModalTitle] = useState<string>();
  const [jsonViewerModalOpen, setJSONViewerModalOpen] = useState<boolean>(false);
  const [logMetricDetailModalOpen, setLogMetricDetailModalOpen] = useState(false);
  const [logMetricDetailModalData, setLogMetricDetailModalData] = useState<{
    log: SceneActionLog;
    metrics: SceneMetricDefinition[];
    metricsConfig: Record<string, SceneMetricConfig>;
    humanOnlyEvaluationMode: boolean;
  }>();

  const loadDataFromLocal = async (regenResultBundle = true) => {
    try {
      setLoading(true);
      const checkTaskServerResp = await ServerAPI.sceneTask.checkTaskServer(taskId);
      setTaskServerAlive(checkTaskServerResp);
      if (regenResultBundle && checkTaskServerResp) {
        await ServerAPI.sceneTask.regenTaskResultBundle(taskId);
      }
      const bundlePath = await ServerAPI.sceneTask.resultBundlePath(taskId);
      const serverBundle = await LocalAPI.sceneTask.getResultBundle(bundlePath);
      await globalStore.syncTaskStateFromServer(taskId);
      globalStore.updatePageTitle((state) => {
        return `${state.currentProject?.metadata.scene_metadata.scene_definition.name || ''} Task Result`;
      });
      setServerBundle(serverBundle);
      setLoading(false);
    } catch (e) {
      console.error(e);
      message.error('Load task result failed!');
    }
  };

  useEffect(() => {
    loadDataFromLocal();
  }, []);

  function getSpecializedReportComponents(): {
    displayName: string;
    component: React.ComponentType<DefaultResultReportComponentProps>;
  }[] {
    const components: {
      displayName: string;
      component: React.ComponentType<DefaultResultReportComponentProps>;
    }[] = [];
    const checkMetrics = (requiredMetrics: string[]) => {
      const existMetrics = Array.from(new Set(Object.keys(serverBundle?.metrics.merged_metrics || {})));
      return requiredMetrics.every((m) => existMetrics.includes(m));
    };
    switch (scene?.scene_metadata.scene_definition.name) {
      case '谁是卧底':
        {
          if (checkMetrics(WhoIsTheSpyCNDefaultReport.requiredMetrics)) {
            components.push({
              displayName: WhoIsTheSpyCNDefaultReport.reportName,
              component: ResultReportComponentWithExtraProps(WhoIsTheSpyCNDefaultReport, {}),
            });
          }
        }
        break;
      default:
        break;
    }
    return components;
  }

  const reportComponents = useMemo(() => {
    return getSpecializedReportComponents();
  }, [scene, serverBundle?.metrics]);

  const hasSpecializedReport = reportComponents.length > 0;
  const hasServerCharts = Object.keys(serverBundle?.charts || {}).length > 0;
  const showReportPart = hasSpecializedReport || hasServerCharts;

  return (
    <>
      <LoadingOverlay fullScreen={true} spinning={loading} tip={loadingTip} />
      {globalStore.currentProject && serverBundle && scene && createSceneTaskParams && (
        <>
          <Container>
            <Content>
              <Space direction={'vertical'}>
                <Card
                  title={'Task Info'}
                  bodyStyle={{
                    padding: 0,
                  }}
                >
                  <CustomCollapseWrapper>
                    <Collapse
                      defaultActiveKey={['basic']}
                      items={[
                        {
                          key: 'basic',
                          label: 'Scene Info',
                          children: (
                            <Descriptions
                              items={[
                                {
                                  key: '1',
                                  label: 'Name',
                                  span: 24,
                                  children: scene.scene_metadata.scene_definition.name,
                                },
                                {
                                  key: '2',
                                  label: 'Description',
                                  span: 24,
                                  children: scene.scene_metadata.scene_definition.description,
                                },
                                {
                                  key: '3',
                                  label: 'Scene Config',
                                  children: (
                                    <Button
                                      {...jsonCodeButtonCommonProps}
                                      onClick={() => {
                                        setViewingJSON(serverBundle?.sceneObjConfig);
                                        setJSONViewerModalTitle('Scene Config Detail');
                                        setJSONViewerModalOpen(true);
                                      }}
                                    />
                                  ),
                                },
                              ]}
                            />
                          ),
                        },
                        ...Object.keys(roleAgentConfigMap)
                          .filter((r) => roleAgentConfigMap[r].length > 0)
                          .map((r) => {
                            return {
                              key: `${r}-agents`,
                              label: `${r} agents`,
                              children: (
                                <Space>
                                  {roleAgentConfigMap[r].map((agentConfig) => {
                                    const agentMetadata = scene.agents_metadata[r].findLast((am) => {
                                      return am.obj_for_import.obj === agentConfig.obj_for_import.obj;
                                    });
                                    if (!agentMetadata) return false;
                                    return (
                                      <AgentCard
                                        key={agentConfig.config_data.profile.id}
                                        displayMode
                                        role={'agent'}
                                        sceneAgentConfig={agentConfig}
                                        sceneAgentMeta={agentMetadata}
                                        onEditButtonClick={() => {
                                          setViewingJSON(agentConfig.config_data);
                                          setJSONViewerModalTitle('Agent Detail');
                                          setJSONViewerModalOpen(true);
                                        }}
                                      />
                                    );
                                  })}
                                </Space>
                              ),
                            };
                          }),
                      ]}
                    />
                  </CustomCollapseWrapper>
                </Card>
                {showReportPart && (
                  <Card
                    title={'Report'}
                    bodyStyle={{
                      padding: 0,
                    }}
                  >
                    <CustomCollapseWrapper>
                      <Collapse
                        defaultActiveKey={[
                          ...reportComponents.map((rc) => rc.displayName),
                          ...(hasServerCharts ? ['charts'] : []),
                        ]}
                        items={[
                          ...reportComponents.map((reportComponent) => {
                            const ReportComponent = reportComponent.component;
                            return {
                              key: reportComponent.displayName,
                              label: reportComponent.displayName,
                              children: (
                                <ReportComponent
                                  scene={scene}
                                  createSceneTaskParams={createSceneTaskParams}
                                  logs={serverBundle.logs}
                                  metrics={serverBundle.metrics}
                                />
                              ),
                            };
                          }),
                          ...(hasServerCharts
                            ? [
                                {
                                  key: 'charts',
                                  label: 'Charts',
                                  children: (
                                    <div
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'flex-start',
                                        alignItems: 'stretch',
                                        flexWrap: 'wrap',
                                        gap: 10,
                                      }}
                                    >
                                      {Object.entries(serverBundle.charts).map(
                                        ([chartName, chartSpec], index: number) => {
                                          return <VegaChart key={chartName + index} vSpec={chartSpec} />;
                                        }
                                      )}
                                    </div>
                                  ),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </CustomCollapseWrapper>
                  </Card>
                )}
                <Card
                  title={'Logs'}
                  bodyStyle={{
                    padding: '12px 16px',
                  }}
                  extra={
                    <Space
                      size={4}
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setShowLogsMetrics(!showLogsMetrics);
                      }}
                    >
                      <Switch
                        size="small"
                        checked={showLogsMetrics}
                        style={{
                          pointerEvents: 'none',
                        }}
                      />
                      Show Metrics
                    </Space>
                  }
                >
                  <Table<SceneActionLog>
                    rowKey={'id'}
                    tableLayout={'fixed'}
                    bordered
                    style={{
                      width: '100%',
                    }}
                    columns={[
                      {
                        width: 180,
                        title: 'Created At',
                        dataIndex: 'created_at',
                        render: (text) => {
                          return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
                        },
                      },
                      {
                        width: 120,
                        title: 'Sender',
                        render: (_, record) => {
                          let color: string | undefined;
                          if (!record.response.sender.role?.is_static) {
                            color = agentConfigMap[record.response.sender.id]?.config_data.chart_major_color;
                          }
                          return <SampleAgentComponent name={record.response.sender.name} color={color} />;
                        },
                      },
                      {
                        width: 120,
                        title: 'Receivers',
                        render: (_, record) => {
                          return (
                            <Space direction={'vertical'}>
                              {record.response.receivers.map((r) => {
                                let color: string | undefined;
                                if (!r.role?.is_static) {
                                  color = agentConfigMap[r.id]?.config_data.chart_major_color;
                                }
                                return <SampleAgentComponent key={r.id} name={r.name} color={color} />;
                              })}
                            </Space>
                          );
                        },
                      },
                      {
                        title: 'Log Message',
                        dataIndex: 'log_msg',
                      },
                      {
                        title: 'Response',
                        dataIndex: 'response',
                        ellipsis: true,
                        render: (_, record) => {
                          return getSceneLogMessageDisplayContent(
                            record.response,
                            false,
                            createSceneTaskParams.project_id
                          );
                        },
                      },
                      {
                        title: 'Operation',
                        render: (_, record) => {
                          const buttonProps: ButtonProps = {
                            type: 'text',
                            size: 'small',
                            style: {
                              color: theme.colorPrimary,
                            },
                          };
                          return (
                            <Space>
                              <Button
                                {...buttonProps}
                                onClick={() => {
                                  setViewingLog(record);
                                  setJSONViewerModalTitle('Log Detail');
                                  setJSONViewerModalOpen(true);
                                }}
                              >
                                Detail
                              </Button>
                            </Space>
                          );
                        },
                      },
                    ]}
                    expandable={
                      showLogsMetrics
                        ? {
                            expandedRowKeys: actionLogs.map((l) => l.id),
                            showExpandColumn: false,
                            expandedRowRender: (log) => {
                              const { enabledMetrics, hasMetrics, metrics, metricsConfig } =
                                getSceneActionLogMetricInfo(log, scene, createSceneTaskParams);
                              if (hasMetrics) {
                                return (
                                  <LogMetricArea>
                                    <div className="header">
                                      <div>Metrics:</div>
                                      {taskServerAlive && (
                                        <Button
                                          size="small"
                                          type="text"
                                          style={{
                                            fontSize: '18px',
                                            lineHeight: 1,
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                          }}
                                          icon={<MdEditNote size={'1em'} />}
                                          onClick={() => {
                                            setLogMetricDetailModalData({
                                              log,
                                              metrics,
                                              metricsConfig,
                                              humanOnlyEvaluationMode: false,
                                            });
                                            setLogMetricDetailModalOpen(true);
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div className="metrics">
                                      {enabledMetrics.map((metric, index) => {
                                        const { value, valueStr, reason, human } =
                                          getSceneActionLogMetricEvalRecordDisplayInfo(log, metric.name);
                                        return (
                                          <div key={index} className="metric">
                                            <div className="label">{metric.name}:</div>
                                            <div className="value">{valueStr}</div>
                                            {value !== undefined && (
                                              <Tooltip title={reason}>
                                                <div className={'reason'}>
                                                  {human ? <HumanMetricMark /> : <EvaluatorMark />}
                                                </div>
                                              </Tooltip>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </LogMetricArea>
                                );
                              } else {
                                return '-';
                              }
                            },
                            rowExpandable: () => true,
                          }
                        : undefined
                    }
                    dataSource={actionLogs}
                    pagination={{
                      responsive: true,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `Total ${total} items`,
                    }}
                  />
                </Card>
              </Space>
            </Content>
          </Container>
          <Footer>
            <Space>
              <Badge
                status={taskServerAlive ? 'success' : 'error'}
                text={taskServerAlive ? 'Scene Task Server Online' : 'Scene Task Server Closed'}
              />
            </Space>
            <Space>
              {taskServerAlive && (
                <>
                  <Button
                    danger
                    onClick={async () => {
                      Modal.confirm({
                        title: 'Close Scene Task Server',
                        content:
                          'Once the Scene Task Server is shut down, the result data becomes immutable. Are you certain about shutting down the Scene Task Server?',
                        okButtonProps: {
                          danger: true,
                        },
                        onOk: async () => {
                          try {
                            await ServerAPI.sceneTask.close(taskId);
                            setTaskServerAlive(false);
                          } catch (e) {
                            console.error(e);
                          }
                        },
                        onCancel() {},
                      });
                    }}
                  >
                    Close Scene Task Server
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        setLoadingTip('Regenerating Result Bundle...');
                        setLoading(true);
                        await ServerAPI.sceneTask.regenTaskResultBundle(taskId);
                      } catch (e) {
                        console.error(e);
                        message.error('Regenerate Result Bundle Failed!');
                        setLoading(false);
                      }
                      setLoadingTip('Reloading result data...');
                      await loadDataFromLocal(false);
                    }}
                  >
                    Regenerate Result Bundle
                  </Button>
                </>
              )}
              <Button
                onClick={async () => {
                  const bundlePath = await ServerAPI.sceneTask.resultBundlePath(taskId);
                  await LocalAPI.dict.open(bundlePath);
                }}
              >
                Open Result Bundle Dict
              </Button>
            </Space>
          </Footer>
          <LogMetricDetailModal
            open={logMetricDetailModalOpen}
            editable={true}
            humanOnlyEvaluationMode={logMetricDetailModalData?.humanOnlyEvaluationMode || false}
            projectId={globalStore.currentProject.id}
            taskId={taskId}
            log={logMetricDetailModalData?.log}
            metrics={logMetricDetailModalData?.metrics}
            metricsConfig={logMetricDetailModalData?.metricsConfig}
            onNeedClose={() => {
              setLogMetricDetailModalOpen(false);
              setLogMetricDetailModalData(undefined);
            }}
            onOpenJSONDetail={(data) => {
              setViewingJSON(data);
              setJSONViewerModalOpen(true);
              setViewingLog(undefined);
            }}
            onLogChanged={async () => {
              setLoadingTip('Reloading result data...');
              await loadDataFromLocal();
            }}
          />
        </>
      )}
      <JSONViewModal
        title={jsonViewerModalTitle}
        open={jsonViewerModalOpen}
        jsonObject={viewingLog || viewingJSON}
        isSceneLog={!!viewingLog}
        projectId={globalStore.currentProject?.id}
        onNeedClose={() => {
          setJSONViewerModalOpen(false);
          setViewingJSON(undefined);
          setViewingLog(undefined);
        }}
      />
    </>
  );
};

export default TaskResultPage;
