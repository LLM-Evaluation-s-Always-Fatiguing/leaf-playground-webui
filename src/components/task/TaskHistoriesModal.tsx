'use client';

import React, { useEffect } from 'react';
import { Button, ButtonProps, Modal, Space, Table, theme } from 'antd';
import TaskInfo from '@/types/api-router/TaskInfo';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';
import { useRouter } from 'next/navigation';
import LocalAPI from '@/services/local';
import { useTheme } from 'antd-style';

interface TaskHistoriesModalProps {
  open: boolean;
  scene: Scene;
  tasks: TaskInfo[];
  onApplyHistoryTaskConfig: (runConfig: RunSceneConfig) => void;
  onNeedClose: () => void;
}

const TaskHistoriesModal: React.FC<TaskHistoriesModalProps> = ({
  open,
  scene,
  tasks,
  onApplyHistoryTaskConfig,
  onNeedClose,
}) => {
  const theme = useTheme();

  const resetState = () => {};

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
        },
      }}
      footer={null}
      onCancel={() => {
        onNeedClose();
      }}
      title={`${scene.scene_metadata.name} Task Histories`}
    >
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
                      const taskDetail = await LocalAPI.taskResultBundle.getInfo(record.bundlePath);
                      onApplyHistoryTaskConfig(taskDetail.runConfig);
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
                      window.open(`/result/${record.id}?bundlePath=${encodeURIComponent(record.bundlePath)}`, '_blank');
                    }}
                  >
                    Result
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

export default TaskHistoriesModal;
