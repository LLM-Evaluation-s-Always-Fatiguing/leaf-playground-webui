'use client';

import React, { useEffect } from 'react';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Scene from '@/types/server/meta/Scene';
import { SceneTaskStatus, SceneTaskStatusDisplayStrMap } from '@/types/server/task/SceneTask';
import SceneTaskHistory from '@/types/server/task/SceneTaskHistory';
import { Button, ButtonProps, Modal, Space, Table } from 'antd';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import LoadingOverlay from '@/components/loading/LoadingOverlay';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';
import { downloadSceneTaskResultZip } from '../../utils/task-result';

interface TaskHistoryModalProps {
  open: boolean;
  scene: Scene;
  tasks: SceneTaskHistory[];
  onApplyHistoryTaskConfig: (createSceneTaskParams: CreateSceneTaskParams) => void;
  onDataChanged: () => Promise<void>;
  onNeedClose: () => void;
}

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({
  open,
  scene,
  tasks,
  onApplyHistoryTaskConfig,
  onDataChanged,
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
            title: 'Task ID',
            dataIndex: 'id',
            ellipsis: true,
          },
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
                        downloadSceneTaskResultZip(record.id);
                      }}
                    >
                      Download Result Zip
                    </Button>
                  )}
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={async () => {
                      Modal.confirm({
                        title: 'Delete task',
                        content: `Confirm delete this task (${record.id}) ?`,
                        okButtonProps: {
                          danger: true,
                        },
                        onOk: async () => {
                          try {
                            await ServerAPI.sceneTask.delete(record.id);
                            setLoading(true);
                            await onDataChanged();
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setLoading(false);
                          }
                        },
                        onCancel() {},
                      });
                    }}
                  >
                    Delete
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
