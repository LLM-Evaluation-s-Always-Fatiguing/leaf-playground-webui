'use client';

import React, { useEffect } from 'react';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Scene from '@/types/server/meta/Scene';
import { SceneTaskStatus, SceneTaskStatusDisplayStrMap } from '@/types/server/task/SceneTask';
import SceneTaskHistory from '@/types/server/task/SceneTaskHistory';
import { Button, ButtonProps, Flex, Modal, Popover, Space, Table, Tree, TreeDataNode } from 'antd';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';

interface TaskHistoryModalProps {
  open: boolean;
  scene: Scene;
  tasks: SceneTaskHistory[];
  onApplyHistoryTaskConfig: (createSceneTaskParams: CreateSceneTaskParams) => void;
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
        rowKey={'id'}
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
          // {
          //   title: 'Agents',
          //   dataIndex: 'roleAgentsMap',
          //   render: (_, record) => {
          //     if (!record.roleAgentsMap) return '-';
          //     const treeData: TreeDataNode[] = [];
          //     Object.entries(record.roleAgentsMap).forEach(([roleName, agentNames]) => {
          //       treeData.push({
          //         key: roleName,
          //         title: `${roleName} agents`,
          //         children: agentNames.map((agentName) => ({
          //           key: agentName,
          //           title: agentName,
          //         })),
          //       });
          //     });
          //     return <Tree defaultExpandAll showLine treeData={treeData} />;
          //   },
          // },
          // {
          //   title: 'Enable Metrics',
          //   dataIndex: 'enableMetricsName',
          //   render: (_, record) => {
          //     if (!record.enableMetricsName) return '-';
          //     return (
          //       <Popover
          //         title={'Enabled Metrics'}
          //         content={
          //           <div
          //             style={{
          //               whiteSpace: 'pre',
          //             }}
          //           >
          //             {record.enableMetricsName.join('\n')}
          //           </div>
          //         }
          //       >
          //         <Flex align={'center'} gap={3}>
          //           {`${record.enableMetricsName?.length || 0} metric${
          //             (record.enableMetricsName?.length || 0) > 1 ? 's' : ''
          //           }`}
          //           <AiOutlineInfoCircle />
          //         </Flex>
          //       </Popover>
          //     );
          //   },
          // },
          // {
          //   title: 'Enable Evaluators',
          //   dataIndex: 'enableEvaluatorsName',
          //   render: (_, record) => {
          //     if (!record.enableEvaluatorsName) return '-';
          //     return (
          //       <Popover
          //         title={'Enabled Evaluators'}
          //         content={
          //           <div
          //             style={{
          //               whiteSpace: 'pre',
          //             }}
          //           >
          //             {record.enableEvaluatorsName.join('\n')}
          //           </div>
          //         }
          //       >
          //         <Flex align={'center'} gap={3}>
          //           {`${record.enableEvaluatorsName.length || 0} evaluator${
          //             (record.enableEvaluatorsName?.length || 0) > 1 ? 's' : ''
          //           }`}
          //           <AiOutlineInfoCircle />
          //         </Flex>
          //       </Popover>
          //     );
          //   },
          // },
          {
            title: 'Created At',
            dataIndex: 'created_at',
            render: (_, record) => {
              return dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss');
            },
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, record) => {
              return SceneTaskStatusDisplayStrMap[record.status];
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
              // const stillRunning =
              //   record.status === SceneTaskStatus.PENDING ||
              //   record.status === SceneTaskStatus.RUNNING ||
              //   record.status === SceneTaskStatus.PAUSED;
              const finished = record.status === SceneTaskStatus.FINISHED;
              const failed = record.status === SceneTaskStatus.INTERRUPTED || record.status === SceneTaskStatus.FAILED;
              return (
                <Space wrap>
                  <Button
                    {...buttonProps}
                    onClick={async () => {
                      setLoading(true);
                      const payload = await ServerAPI.sceneTask.payload(record.id);
                      onApplyHistoryTaskConfig(payload);
                    }}
                  >
                    Replay Task
                  </Button>
                  {!failed && (
                    <Button
                      {...buttonProps}
                      onClick={() => {
                        if (finished) {
                          window.open(`/result/${record.id}`, '_blank');
                        } else {
                          window.open(`/processing/${record.id}`, '_blank');
                        }
                      }}
                    >
                      {finished ? 'To Result' : 'To Processing'}
                    </Button>
                  )}
                  {record.status !== SceneTaskStatus.PENDING && (
                    <Button
                      {...buttonProps}
                      onClick={async () => {
                        const bundlePath = await ServerAPI.sceneTask.resultBundlePath(record.id);
                        await LocalAPI.dict.open(bundlePath);
                      }}
                    >
                      Result Bundle Dict
                    </Button>
                  )}
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
