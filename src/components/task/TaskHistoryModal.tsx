'use client';

import React, { useEffect } from 'react';
import { Button, ButtonProps, Modal, Space, Table } from 'antd';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import Scene from '@/types/server/meta/Scene';
import LocalAPI from '@/services/local';
import { useTheme } from 'antd-style';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import LoadingOverlay from '@/components/common/LoadingOverlay';

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
      width={1080}
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
        columns={[
          {
            title: 'Task ID',
            dataIndex: 'id',
            ellipsis: true,
          },
          {
            title: 'Agents',
            dataIndex: 'agentsName',
            render: (_, record) => {
              return `[${record.agentsName.join(', ')}]`;
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
