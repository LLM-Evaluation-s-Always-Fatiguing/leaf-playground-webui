'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LocalAPI from '@/services/local';
import styled from '@emotion/styled';
import { Button, ButtonProps, Card, Descriptions, Space, Spin, Table } from 'antd';
import JSONViewer from '@/components/common/JSONViewer';
import SceneLog from '@/types/server/Log';
import dayjs from 'dayjs';
import JSONViewerModal from '@/components/common/JSONViewer/Modal';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'antd-style';
import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';

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

const TaskResultPage = ({ params }: { params: { taskId: string } }) => {
  const theme = useTheme();

  const _taskId = params.taskId;
  const searchParams = useSearchParams();
  const bundlePath = searchParams.get('bundlePath');

  const [loading, setLoading] = useState(true);
  const [serverBundle, setServerBundle] = useState<ServerTaskBundle>();
  const [webuiBundle, setWebUIBundle] = useState<WebUITaskBundle>();
  const [operatingLog, setOperatingLog] = useState<SceneLog>();
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
      {loading && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin />
        </div>
      )}
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
          <Card
            style={{
              borderRadius: 0,
            }}
          >
            <Descriptions
              title="Scene Info"
              items={[
                {
                  key: '1',
                  label: 'Config',
                  span: 24,
                  children: (
                    <JSONViewer defaultCollapsed={true} jsonObject={serverBundle.scene.config.scene_info || {}} />
                  ),
                },
                {
                  key: '2',
                  label: 'Agents',
                  span: 2,
                  children: (
                    <Space wrap>
                      {Object.entries(serverBundle.agents || {}).map(([key, agent]: [string, any]) => {
                        return (
                          <Space
                            key={key}
                            style={{
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '10px',
                                background: agent.config.chart_major_color,
                              }}
                            />
                            {agent.config.profile.name}({agent.type.obj})
                          </Space>
                        );
                      })}
                    </Space>
                  ),
                },
                {
                  key: '3',
                  label: 'Agents Config',
                  span: 2,
                  children: (
                    <JSONViewer
                      defaultCollapsed={true}
                      jsonObject={serverBundle.scene.config.scene_agents?.agents || {}}
                    />
                  ),
                },
                {
                  key: '4',
                  label: 'Evaluators Config',
                  span: 24,
                  children: (
                    <JSONViewer defaultCollapsed={true} jsonObject={serverBundle.scene.config.scene_evaluators || {}} />
                  ),
                },
              ]}
            />
          </Card>
          <Card
            title={'Charts'}
            style={{
              borderRadius: 0,
            }}
            bodyStyle={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {(serverBundle?.chartOptions || []).map((option: object, index: number) => {
              return (
                <ReactECharts
                  key={index}
                  option={option}
                  style={{
                    width: '50%',
                  }}
                />
              );
            })}
          </Card>
          <Card
            title={'Logs'}
            style={{
              borderRadius: 0,
            }}
            bodyStyle={{
              padding: 0,
            }}
          >
            <Table<SceneLog>
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
                  width: 100,
                  title: 'Sender',
                  render: (_, record) => {
                    return record.response.sender.name;
                  },
                },
                {
                  width: 100,
                  title: 'Receivers',
                  render: (_, record) => {
                    return record.response.receivers.map((r) => r.name).join(', ');
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
                            setOperatingLog(record);
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
        </Container>
      )}
      <JSONViewerModal
        title={'Log Detail'}
        open={jsonViewerModalOpen}
        jsonObject={operatingLog}
        onNeedClose={() => {
          setJSONViewerModalOpen(false);
        }}
      />
    </>
  );
};

export default TaskResultPage;
