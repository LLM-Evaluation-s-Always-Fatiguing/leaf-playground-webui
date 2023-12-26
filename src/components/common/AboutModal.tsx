'use client';

import React, { CSSProperties, useEffect, useState } from 'react';
import ServerInfo from '@/types/server/meta/ServerInfo';
import { Button, ButtonProps, Descriptions, Modal, Space, Spin, message } from 'antd';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import LocalAPI from '@/services/local';
import ServerAPI from '@/services/server';

interface AboutModalProps {
  open: boolean;
  onNeedClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onNeedClose }) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerInfo>();

  const resetState = () => {
    setModalLoading(false);
  };

  const loadData = async () => {
    try {
      setModalLoading(true);
      const serverInfo = await ServerAPI.info();
      setServerInfo(serverInfo);
    } catch (e) {
      console.error(e);
      message.error('Fetch Server Info Failed');
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      resetState();
      loadData();
    }
  }, [open]);

  const labelStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
  };

  const openDictButtonProps: ButtonProps = {
    size: 'small',
    type: 'link',
    style: { lineHeight: 1 },
  };

  return (
    <Modal
      open={open}
      width={860}
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
      title={`About`}
    >
      <Spin spinning={modalLoading}>
        <Descriptions
          title="Server Info"
          items={[
            {
              key: '1',
              label: 'Server Zoo Root Path',
              span: 24,
              labelStyle,
              children: (
                <Space>
                  {serverInfo?.paths.zoo_dir}
                  <Button
                    {...openDictButtonProps}
                    icon={<AiOutlineFolderOpen size={'1.2em'} />}
                    onClick={() => {
                      if (serverInfo?.paths.zoo_dir) {
                        LocalAPI.dict.open(serverInfo.paths.zoo_dir);
                      }
                    }}
                  />
                </Space>
              ),
            },
            {
              key: '2',
              label: 'Server Save Root Path',
              span: 24,
              labelStyle,
              children: (
                <Space>
                  {serverInfo?.paths.result_dir}
                  <Button
                    {...openDictButtonProps}
                    icon={<AiOutlineFolderOpen size={'1.2em'} />}
                    onClick={() => {
                      if (serverInfo?.paths.result_dir) {
                        LocalAPI.dict.open(serverInfo.paths.result_dir);
                      }
                    }}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Spin>
    </Modal>
  );
};

export default AboutModal;
