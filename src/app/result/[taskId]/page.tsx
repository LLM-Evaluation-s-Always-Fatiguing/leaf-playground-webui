'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LocalAPI from '@/services/local';
import styled from '@emotion/styled';
import { Button, Card, Descriptions, Space, Table } from 'antd';
import JSONViewer from '@/components/common/JSONViewer';
import SceneLog from '@/types/server/Log';
import dayjs from 'dayjs';
import JSONViewerModal from '@/components/common/JSONViewer/Modal';
import ReactECharts from 'echarts-for-react';

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
  const taskId = params.taskId;
  const searchParams = useSearchParams();
  const taskResultSavedDir = searchParams.get('taskResultSavedDir');

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<Record<string, any>>();
  const [operatingLog, setOperatingLog] = useState<SceneLog>();
  const [jsonViewerModalOpen, setJSONViewerModalOpen] = useState<boolean>(false);

  const loadDataFromLocal = async () => {
    if (!taskResultSavedDir || resultData) return;
    setLoading(true);
    const sceneFilePath = taskResultSavedDir + '/scene.json';
    const scene = await LocalAPI.file.readJSON(sceneFilePath);
    const logsFilePath = taskResultSavedDir + '/logs.jsonl';
    const logs = await LocalAPI.file.readJSONL(logsFilePath);
    const agentsFilePath = taskResultSavedDir + '/agents.json';
    const agents = await LocalAPI.file.readJSON(agentsFilePath);
    const metricsFilePath = taskResultSavedDir + '/metrics.jsonl';
    const metrics = await LocalAPI.file.readJSONL(metricsFilePath);
    const chartsDictPath = taskResultSavedDir + '/charts';
    const chartJSONFiles = (await LocalAPI.dict.read(chartsDictPath)).filter((f) => f.fullPath.endsWith('.json'));
    const chartOptions = [];
    for (let chartJson of chartJSONFiles) {
      let content = await LocalAPI.file.readJSON(chartJson.fullPath);
      if (typeof content === 'string') {
        const cmd = `(() => (${content}))()`;
        content = eval(cmd);
      }
      chartOptions.push(content);
    }
    setResultData({
      scene,
      logs,
      agents,
      metrics,
      chartOptions,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDataFromLocal();
  }, []);

  return (
    <>
      <Container>
        <div className="header">
          <div></div>
          <div className="title">{`${resultData?.scene.metadata.name}`}</div>
          <Button
            onClick={async () => {
              await LocalAPI.dict.open(taskResultSavedDir!);
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
                key: '4',
                label: 'Config',
                children: <JSONViewer defaultCollapsed={true} jsonObject={resultData?.scene.config.scene_info || {}} />,
              },
              {
                key: '5',
                label: 'Agents',
                children: (
                  <Space wrap>
                    {Object.entries(resultData?.agents || {}).map(([key, agent]: [string, any]) => {
                      return (
                        <Space
                          key={key}
                          style={{
                            flexShrink: 0,
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
                          Agent: {agent.config.profile.name}({agent.type.obj})
                        </Space>
                      );
                    })}
                  </Space>
                ),
              },
              {
                key: '6',
                label: 'Agents Config',
                children: (
                  <JSONViewer
                    defaultCollapsed={true}
                    jsonObject={resultData?.scene.config.scene_agents?.agents || {}}
                  />
                ),
              },
              {
                key: '7',
                label: 'Evaluators Config',
                children: (
                  <JSONViewer defaultCollapsed={true} jsonObject={resultData?.scene.config.scene_evaluators || {}} />
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
          {(resultData?.chartOptions || []).map((option: object, index: number) => {
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
                dataIndex: ['response', 'content', 'text'],
                ellipsis: true,
              },
              {
                title: 'Operation',
                render: (_, record) => {
                  return (
                    <Space>
                      <Button
                        type={'link'}
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
            dataSource={resultData?.logs || []}
            pagination={{
              responsive: true,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </Card>
      </Container>
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
