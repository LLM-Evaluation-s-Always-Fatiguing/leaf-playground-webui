'use client';

import React, { useEffect } from 'react';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import Scene from '@/types/server/meta/Scene';
import { Button, ButtonProps, Flex, Modal, Popover, Space, Table, Tooltip, Tree, TreeDataNode } from 'antd';
import { useTheme } from 'antd-style';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import LocalAPI from '@/services/local';

interface TaskHistoryModalProps {
  open: boolean;
  scene: Scene;
  tasks: WebUITaskBundleTaskInfo[];
  onApplyHistoryTaskConfig: (createSceneParams: CreateSceneParams) => void;
  onNeedClose: () => void;
}

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({
  open,
  scene,
  tasks,
  onApplyHistoryTaskConfig,
  onNeedClose,
}) => {
  const theme = useTheme();

  const [loading, setLoading] = React.useState(false);

  const resetState = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      width={'max(1024px, 80vw)'}
      destroyOnClose
      styles={{
        body: {
          padding: '30px 0 10px 0',
          overflow: 'hidden auto',
          position: 'relative',
        },
      }}
      footer={null}
      onCancel={() => {
        onNeedClose();
      }}
      title={`${scene.scene_metadata.scene_definition.name} Task History`}
    >
      <LoadingOverlay spinning={loading} tip={'Operating...'} />
      <Table
        rowKey={"id"}
        scroll={{
          y: '65vh',
        }}
        columns={[
          {
            width: 260,
            title: 'Task ID',
            dataIndex: 'id',
            ellipsis: true,
          },
          {
            title: 'Agents',
            dataIndex: 'roleAgentsMap',
            render: (_, record) => {
              if (!record.roleAgentsMap) return '-';
              const treeData: TreeDataNode[] = [];
              Object.entries(record.roleAgentsMap).forEach(([roleName, agentNames]) => {
                treeData.push({
                  key: roleName,
                  title: `${roleName} agents`,
                  children: agentNames.map((agentName) => ({
                    key: agentName,
                    title: agentName,
                  })),
                });
              });
              return <Tree defaultExpandAll showLine treeData={treeData} />;
            },
          },
          {
            title: 'Enable Metrics',
            dataIndex: 'enableMetricsName',
            render: (_, record) => {
              if (!record.enableMetricsName) return '-';
              return (
                <Popover
                  title={'Enabled Metrics'}
                  content={
                    <div
                      style={{
                        whiteSpace: 'pre',
                      }}
                    >
                      {record.enableMetricsName.join('\n')}
                    </div>
                  }
                >
                  <Flex align={'center'} gap={3}>
                    {`${record.enableMetricsName?.length || 0} metric${
                      (record.enableMetricsName?.length || 0) > 1 ? 's' : ''
                    }`}
                    <AiOutlineInfoCircle />
                  </Flex>
                </Popover>
              );
            },
          },
          {
            title: 'Enable Evaluators',
            dataIndex: 'enableEvaluatorsName',
            render: (_, record) => {
              if (!record.enableEvaluatorsName) return '-';
              return (
                <Popover
                  title={'Enabled Evaluators'}
                  content={
                    <div
                      style={{
                        whiteSpace: 'pre',
                      }}
                    >
                      {record.enableEvaluatorsName.join('\n')}
                    </div>
                  }
                >
                  <Flex align={'center'} gap={3}>
                    {`${record.enableEvaluatorsName.length || 0} evaluator${
                      (record.enableEvaluatorsName?.length || 0) > 1 ? 's' : ''
                    }`}
                    <AiOutlineInfoCircle />
                  </Flex>
                </Popover>
              );
            },
          },
          {
            title: 'Created At',
            dataIndex: 'time',
          },
          {
            title: 'Finished',
            dataIndex: 'finished',
            render: (finished) => {
              return finished ? 'Yes' : 'No';
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
                <Space wrap>
                  <Button
                    {...buttonProps}
                    onClick={async () => {
                      setLoading(true);
                      const taskDetail = await LocalAPI.taskBundle.webui.get(record.bundlePath);
                      onApplyHistoryTaskConfig(taskDetail.createSceneParams);
                    }}
                  >
                    Replay
                  </Button>
                  <Button
                    {...buttonProps}
                    onClick={async () => {
                      await LocalAPI.dict.open(record.bundlePath);
                    }}
                  >
                    Result Dict
                  </Button>
                  <Button
                    {...buttonProps}
                    onClick={() => {
                      if (record.finished) {
                        window.open(
                          `/result/${record.id}?bundlePath=${encodeURIComponent(record.bundlePath)}`,
                          '_blank'
                        );
                      } else {
                        window.open(
                          `/processing/${record.id}?serverUrl=${encodeURIComponent(
                            record.serverUrl
                          )}&bundlePath=${encodeURIComponent(record.bundlePath)}`,
                          '_blank'
                        );
                      }
                    }}
                  >
                    {record.finished ? 'Result' : 'Check'}
                  </Button>
                </Space>
              );
            },
          },
        ]}
        dataSource={tasks}
      />
    </Modal>
  );
};
export default TaskHistoryModal;
