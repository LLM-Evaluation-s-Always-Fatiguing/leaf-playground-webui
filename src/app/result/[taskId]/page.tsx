'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import LocalAPI from '@/services/local';
import styled from '@emotion/styled';
import { Button, ButtonProps, Card, Collapse, Descriptions, Space, Table } from 'antd';
import { SceneActionLog, SceneLogType } from '@/types/server/Log';
import dayjs from 'dayjs';
import JSONViewModal from '@/components/common/JSONViewModal';
import { useTheme } from 'antd-style';
import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { TbCodeDots } from 'react-icons/tb';
import AgentCard from '@/components/agent/AgentCard';
import ServerTaskBundleChart from '@/types/api-router/server/task-bundle/Chart';
import VegaChart from '@/components/vega/VegaChart';
import { getRoleAgentConfigsMapFromCreateSceneParams } from '@/types/server/CreateSceneParams';
import flatten from 'lodash/flatten';
import keyBy from 'lodash/keyBy';

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

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const theme = useTheme();

  const _taskId = params.taskId;
  const searchParams = useSearchParams();
  const bundlePath = searchParams.get('bundlePath');

  const [loading, setLoading] = useState(true);
  const [serverBundle, setServerBundle] = useState<ServerTaskBundle>();
  const [webuiBundle, setWebUIBundle] = useState<WebUITaskBundle>();
  const actionLogs = useMemo(() => {
    return (serverBundle?.logs || []).filter((l) => l.log_type === SceneLogType.ACTION) as SceneActionLog[];
  }, [serverBundle?.logs]);
  const roleAgentConfigMap = useMemo(() => {
    if (webuiBundle?.createSceneParams) {
      return getRoleAgentConfigsMapFromCreateSceneParams(webuiBundle.createSceneParams);
    }
    return {};
  }, [webuiBundle?.createSceneParams]);
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
  const [jsonViewerModalTitle, setJSONViewerModalTitle] = useState<string>();
  const [jsonViewerModalOpen, setJSONViewerModalOpen] = useState<boolean>(false);

  const loadDataFromLocal = async () => {
    if (!bundlePath) return;
    setLoading(true);
    const serverBundle = await LocalAPI.taskBundle.server.get(bundlePath);
    const webuiBundle = await LocalAPI.taskBundle.webui.get(bundlePath);
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
            <div className="title">{`${webuiBundle.scene.scene_metadata.scene_definition.name}`}</div>
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
                title={'Task Info'}
                bodyStyle={{
                  padding: 0,
                }}
              >
                <CustomCollapseWrapper>
                  <Collapse
                    defaultActiveKey={['basic', ...Object.keys(roleAgentConfigMap).map((rn) => `${rn}-agents`)]}
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
                              alignItems: 'stretch',
                              flexWrap: 'wrap',
                              gap: 10,
                            }}
                          >
                            {[].map((chart: ServerTaskBundleChart, index: number) => {
                              return (
                                <NormalNoBoxShadowCard
                                  key={chart.name + index}
                                  bodyStyle={{
                                    width: '100%',
                                    height: '100%',
                                    padding: '12px 16px',
                                  }}
                                  bordered={false}
                                  hoverable
                                >
                                  <VegaChart chart={chart} />
                                </NormalNoBoxShadowCard>
                              );
                            })}
                          </div>
                        ),
                      },
                      // {
                      //   key: 'metrics',
                      //   label: 'Metrics',
                      //   children: (
                      //     <Descriptions
                      //       items={[
                      //         ...serverBundle.metrics.map((metric, index) => {
                      //           return {
                      //             key: index,
                      //             label: metric.evaluator,
                      //             children: (
                      //               <Button
                      //                 {...jsonCodeButtonCommonProps}
                      //                 onClick={() => {
                      //                   setViewingJSON(metric);
                      //                   setJSONViewerModalTitle('SceneMetricConfig Detail');
                      //                   setJSONViewerModalOpen(true);
                      //                 }}
                      //               />
                      //             ),
                      //           };
                      //         }),
                      //       ]}
                      //     />
                      //   ),
                      // },
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
                <Table<SceneActionLog>
                  rowKey={'index'}
                  tableLayout={'fixed'}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  columns={[
                    {
                      width: 80,
                      title: 'ID',
                      dataIndex: 'id',
                      ellipsis: true,
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
        jsonObject={viewingJSON}
        onNeedClose={() => {
          setJSONViewerModalOpen(false);
        }}
      />
    </>
  );
};

export default TaskResultPage;
