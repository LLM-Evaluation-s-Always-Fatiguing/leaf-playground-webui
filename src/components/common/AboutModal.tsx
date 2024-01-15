'use client';

import React, { CSSProperties, useEffect, useState } from 'react';
import ServerAppInfo from '@/types/server/meta/ServerAppInfo';
import { ButtonProps, Descriptions, Modal, Space, Spin, message } from 'antd';
import ServerAPI from '@/services/server';

interface AboutModalProps {
  open: boolean;
  onNeedClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onNeedClose }) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerAppInfo>();

  const resetState = () => {
    setModalLoading(false);
  };

  const loadData = async () => {
    try {
      setModalLoading(true);
      const homepageResp = await ServerAPI.site.homepage();
      setServerInfo(homepageResp.app_info);
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
              label: 'Server Name',
              span: 24,
              labelStyle,
              children: <Space>{serverInfo?.name}</Space>,
            },
            {
              key: '2',
              label: 'Server Version',
              span: 24,
              labelStyle,
              children: <Space>{serverInfo?.version}</Space>,
            },
            {
              key: '3',
              label: 'Hub Dir',
              span: 24,
              labelStyle,
              children: <Space>{serverInfo?.hub_dir}</Space>,
            },
          ]}
        />
      </Spin>
    </Modal>
  );
};

export default AboutModal;
