'use client';

import React, { useEffect } from 'react';
import { Button, Modal, Space, Table } from 'antd';
import TaskInfo from '@/types/api-router/TaskInfo';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import Scene from '@/types/server/Scene';
import { useRouter } from 'next/navigation';
import LocalAPI from '@/services/local';

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
  const router = useRouter();

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
              return (
                <Space wrap>
                  <Button
                    type="link"
                    size={'small'}
                    onClick={async () => {
                      const taskDetail = await LocalAPI.taskResultBundle.getInfo(record.bundlePath);
                      onApplyHistoryTaskConfig(taskDetail.runConfig);
                    }}
                  >
                    Replay
                  </Button>
                  <Button
                    type="link"
                    size={'small'}
                    onClick={async () => {
                      await LocalAPI.dict.open(record.bundlePath);
                    }}
                  >
                    Result Dict
                  </Button>
                  <Button
                    type="link"
                    size={'small'}
                    onClick={() => {
                      window.open(
                        `/result/${record.id}?taskResultSavedDir=${encodeURIComponent(record.bundlePath)}`,
                        '_blank'
                      );
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
