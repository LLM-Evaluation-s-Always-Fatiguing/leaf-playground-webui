'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import { getRoleAgentConfigsMapFromCreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneActionLog, SceneLogType } from '@/types/server/common/Log';
import { Button, ButtonProps, Card, Collapse, Descriptions, Space, Table, Tooltip } from 'antd';
import { useTheme } from 'antd-style';
import { Switch } from '@formily/antd-v5';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import flatten from 'lodash/flatten';
import keyBy from 'lodash/keyBy';
import { TbCodeDots } from 'react-icons/tb';
import AgentCard from '@/components/agent/AgentCard';
import JSONViewModal from '@/components/common/JSONViewModal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { EvaluatorMark } from '@/components/homepage/icons/EvaluatorMark';
import { HumanMetricMark } from '@/components/processing/common/icons/HumanMetricMark';
import ResultReportComponentWithExtraProps from '@/components/result/common/ReportComponentWithExtraProps';
import { DefaultResultReportComponentProps } from '@/components/result/def';
import WhoIsTheSpyDefaultReport from '@/components/result/specialized/who-is-the-spy/DefaultReport';
import VegaChart from '@/components/vega/VegaChart';
import LocalAPI from '@/services/local';
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

const NormalNoBoxShadowCard = styled(Card)`
  :not(:hover) {
    box-shadow: none;
  }
`;

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

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const theme = useTheme();

  const globalStore = useGlobalStore();

  const _taskId = params.taskId;
  const searchParams = useSearchParams();
  const bundlePath = searchParams.get('bundlePath');

  const [loading, setLoading] = useState(true);
  const [serverBundle, setServerBundle] = useState<ServerTaskBundle>();
  const [webuiBundle, setWebUIBundle] = useState<WebUITaskBundle>();
  const actionLogs = useMemo(() => {
    return (serverBundle?.logs || []).filter((l) => l.log_type === SceneLogType.ACTION) as SceneActionLog[];
  }, [serverBundle?.logs]);
  const [showLogsMetrics, setShowLogsMetrics] = useState<boolean>(false);
  const roleAgentConfigMap = useMemo(() => {
    if (webuiBundle?.createSceneTaskParams) {
      return getRoleAgentConfigsMapFromCreateSceneTaskParams(webuiBundle.createSceneTaskParams);
    }
    return {};
  }, [webuiBundle?.createSceneTaskParams]);
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

  const loadDataFromLocal = async () => {
    if (!bundlePath) return;
    setLoading(true);
    const serverBundle = await LocalAPI.taskBundle.server.get(bundlePath);
    const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath);
    globalStore.updatePageTitle(webuiBundle.scene.scene_metadata.scene_definition.name || '');
    globalStore.updateInfoFromWebUITaskBundle(webuiBundle);
    setServerBundle(serverBundle);
    setWebUIBundle(webuiBundle);
    setLoading(false);
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
      const existMetrics = Array.from(
        new Set([
          ...Object.keys(serverBundle?.metrics.metrics || {}),
          ...Object.keys(serverBundle?.metrics.human_metrics || {}),
        ])
      );
      return requiredMetrics.every((m) => existMetrics.includes(m));
    };
    switch (webuiBundle?.scene.scene_metadata.scene_definition.name) {
      case '谁是卧底':
        {
          if (checkMetrics(WhoIsTheSpyDefaultReport.requiredMetrics)) {
            components.push({
              displayName: WhoIsTheSpyDefaultReport.reportName,
              component: ResultReportComponentWithExtraProps(WhoIsTheSpyDefaultReport, {}),
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
  }, [webuiBundle?.scene, serverBundle?.metrics]);

  const hasSpecializedReport = reportComponents.length > 0;
  const hasServerCharts = Object.keys(serverBundle?.charts || {}).length > 0;
  const showReportPart = hasSpecializedReport || hasServerCharts;

  return (
    <>
      <LoadingOverlay spinning={loading} tip={'Loading...'} />
      {!loading && serverBundle && webuiBundle && (
        <Container>
          <Content>
            <Space direction={'vertical'}>
              <Card
                title={'Task Info'}
                bodyStyle={{
                  padding: 0,
                }}
                extra={
                  <Button
                    onClick={async () => {
                      await LocalAPI.dict.open(bundlePath!);
                    }}
                  >
                    Open Source Dict
                  </Button>
                }
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
                                children: webuiBundle.scene.scene_metadata.scene_definition.name,
                              },
                              {
                                key: '2',
                                label: 'Description',
                                span: 24,
                                children: webuiBundle.scene.scene_metadata.scene_definition.description,
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
                                  const agentMetadata = webuiBundle.scene.agents_metadata[r].findLast((am) => {
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
                                scene={webuiBundle.scene}
                                createSceneTaskParams={webuiBundle.createSceneTaskParams}
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
                                        return (
                                          <NormalNoBoxShadowCard
                                            key={chartName + index}
                                            bodyStyle={{
                                              width: '100%',
                                              height: '100%',
                                              padding: '12px 16px',
                                            }}
                                            bordered={false}
                                            hoverable
                                          >
                                            <VegaChart vSpec={chartSpec} />
                                          </NormalNoBoxShadowCard>
                                        );
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
                  rowKey={'created_at'}
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
                        return getSceneLogMessageDisplayContent(record.response);
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
                            const { enabledMetrics, hasMetrics } = getSceneActionLogMetricInfo(
                              log,
                              webuiBundle.scene,
                              webuiBundle.createSceneTaskParams
                            );
                            if (hasMetrics) {
                              return (
                                <LogMetricArea>
                                  <div className="header">
                                    <div>Metrics:</div>
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
      )}
      <JSONViewModal
        title={jsonViewerModalTitle}
        open={jsonViewerModalOpen}
        jsonObject={viewingLog || viewingJSON}
        isSceneLog={!!viewingLog}
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
