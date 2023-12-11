'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import LocalAPI from '@/services/local';
import styled from '@emotion/styled';
import { Button, ButtonProps, Card, Collapse, Descriptions, Space, Spin, Table } from 'antd';
import SceneLog from '@/types/server/Log';
import dayjs from 'dayjs';
import JSONViewModal from '@/components/common/JSONViewModal';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'antd-style';
import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { TbCodeDots } from 'react-icons/tb';
import AgentCard from '@/components/agent/AgentCard';
import ServerTaskBundleChart from '@/types/api-router/server/task-bundle/Chart';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  .header {
    height: 65px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: ${(props) => props.theme.colorBorderSecondary};

    .title {
      font-size: 21px;
      font-weight: 500;
    }
  }
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
          whiteSpace: 'pre-line',
          wordBreak: 'break-all',
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

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const theme = useTheme();

  const _taskId = params.taskId;
  const searchParams = useSearchParams();
  const bundlePath = searchParams.get('bundlePath');

  const [loading, setLoading] = useState(true);
  const [serverBundle, setServerBundle] = useState<ServerTaskBundle>();
  const [webuiBundle, setWebUIBundle] = useState<WebUITaskBundle>();
  const [viewingJSON, setViewingJSON] = useState<any>();
  const [jsonViewerModalTitle, setJSONViewerModalTitle] = useState<string>();
  const [jsonViewerModalOpen, setJSONViewerModalOpen] = useState<boolean>(false);

  const loadDataFromLocal = async () => {
    if (!bundlePath) return;
    setLoading(true);
    const serverBundle = await LocalAPI.taskBundle.server.get(bundlePath);
    const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath);
    console.log(serverBundle);
    console.log(webuiBundle);
    setServerBundle(serverBundle);
    setWebUIBundle(webuiBundle);
    setLoading(false);
  };

  useEffect(() => {
    loadDataFromLocal();
  }, []);

  return (
    <>
      <LoadingOverlay spinning={loading} tip={'Loading...'} />
      {!loading && serverBundle && webuiBundle && (
        <Container>
          <div className="header">
            <div></div>
            <div className="title">{`${webuiBundle.scene.scene_metadata.name}`}</div>
            <Button
              onClick={async () => {
                await LocalAPI.dict.open(bundlePath!);
              }}
            >
              Open Source Dict
            </Button>
          </div>
          <Content>
            <Space direction={'vertical'}>
              <Card
                title={'Basic'}
                bodyStyle={{
                  padding: 0,
                }}
              >
                <CustomCollapseWrapper>
                  <Collapse
                    defaultActiveKey={['basic', 'agents']}
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
                                children: webuiBundle.scene.scene_metadata.name,
                              },
                              {
                                key: '2',
                                label: 'Description',
                                span: 24,
                                children: webuiBundle.scene.scene_metadata.description,
                              },
                              {
                                key: '3',
                                label: 'Scene Instance',
                                children: (
                                  <Button
                                    {...jsonCodeButtonCommonProps}
                                    onClick={() => {
                                      setViewingJSON(serverBundle?.scene);
                                      setJSONViewerModalTitle('Scene Instance Detail');
                                      setJSONViewerModalOpen(true);
                                    }}
                                  />
                                ),
                              },
                            ]}
                          />
                        ),
                      },
                      {
                        key: 'agents',
                        label: 'Scene Agents',
                        children: (
                          <Space>
                            {webuiBundle.agentConfigs.map((agentConfig) => {
                              const agentClassName = serverBundle.agents[agentConfig.profile.id]?.metadata.cls_name;
                              if (!agentClassName) return false;
                              const agentId = Object.entries(webuiBundle.scene.agents_metadata).findLast(([id, am]) => {
                                return am.cls_name === agentClassName;
                              })?.[0];
                              if (!agentId) return false;
                              return (
                                <AgentCard
                                  key={agentConfig.profile.id}
                                  displayMode
                                  role={'agent'}
                                  agentsConfigFormilySchemas={webuiBundle.scene.agentsConfigFormilySchemas}
                                  sceneAgentConfig={{ agent_id: agentId, agent_config_data: agentConfig }}
                                  onEditButtonClick={() => {
                                    setViewingJSON(serverBundle.agents[agentConfig.profile.id]);
                                    setJSONViewerModalTitle('Agent Detail');
                                    setJSONViewerModalOpen(true);
                                  }}
                                />
                              );
                            })}
                          </Space>
                        ),
                      },
                    ]}
                  />
                </CustomCollapseWrapper>
              </Card>
              <Card
                title={'Report'}
                bodyStyle={{
                  padding: 0,
                }}
              >
                <CustomCollapseWrapper>
                  <Collapse
                    defaultActiveKey={['charts', 'metrics']}
                    items={[
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
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 10,
                            }}
                          >
                            {(serverBundle?.charts || []).map((chart: ServerTaskBundleChart, index: number) => {
                              return (
                                <NormalNoBoxShadowCard
                                  key={chart.name + index}
                                  style={{
                                    width: 'calc(50% - 5px)',
                                  }}
                                  bodyStyle={{
                                    width: '100%',
                                    padding: '12px 16px',
                                  }}
                                  bordered={false}
                                  hoverable
                                >
                                  <ReactECharts
                                    option={chart.eChartOption}
                                    style={{
                                      width: '100%',
                                    }}
                                  />
                                </NormalNoBoxShadowCard>
                              );
                            })}
                          </div>
                        ),
                      },
                      {
                        key: 'metrics',
                        label: 'Metrics',
                        children: (
                          <Descriptions
                            items={[
                              ...serverBundle.metrics.map((metric, index) => {
                                return {
                                  key: index,
                                  label: metric.evaluator,
                                  children: (
                                    <Button
                                      {...jsonCodeButtonCommonProps}
                                      onClick={() => {
                                        setViewingJSON(metric);
                                        setJSONViewerModalTitle('Metric Detail');
                                        setJSONViewerModalOpen(true);
                                      }}
                                    />
                                  ),
                                };
                              }),
                            ]}
                          />
                        ),
                      },
                    ]}
                  />
                </CustomCollapseWrapper>
              </Card>
              <Card
                title={'Logs'}
                bodyStyle={{
                  padding: '12px 16px',
                }}
              >
                <Table<SceneLog>
                  rowKey={'index'}
                  tableLayout={'fixed'}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  columns={[
                    {
                      width: 80,
                      title: 'Index',
                      dataIndex: 'index',
                    },
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
                          color = serverBundle?.agents[record.response.sender.id]?.config.chart_major_color;
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
                                color = serverBundle?.agents[r.id]?.config.chart_major_color;
                              }
                              return <SampleAgentComponent key={r.id} name={r.name} color={color} />;
                            })}
                          </Space>
                        );
                      },
                    },
                    {
                      title: 'Narrator',
                      dataIndex: 'narrator',
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
                                setViewingJSON(record);
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
                  dataSource={serverBundle?.logs || []}
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
        jsonObject={viewingJSON}
        onNeedClose={() => {
          setJSONViewerModalOpen(false);
        }}
      />
    </>
  );
};

export default TaskResultPage;
