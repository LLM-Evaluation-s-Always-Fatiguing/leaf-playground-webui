'use client';

import React, { useEffect } from 'react';
import { Modal } from 'antd';
import JSONViewer from '@/components/common/JSONViewer/index';

interface JSONViewerModalProps {
  open: boolean;
  title?: string;
  jsonObject?: object | any[];
  onNeedClose: () => void;
}

const JSONViewerModal: React.FC<JSONViewerModalProps> = ({ open, title, jsonObject, onNeedClose }) => {
  const resetState = () => {};

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      width={680}
      destroyOnClose
      centered
      styles={{
        body: {
          padding: '30px 0 10px 0',
          maxHeight: '80vh',
          overflow: 'hidden auto',
        },
      }}
      footer={null}
      onCancel={() => {
        onNeedClose();
      }}
      title={title || 'JSON Viewer'}
    >
      <JSONViewer jsonObject={jsonObject} />
    </Modal>
  );
};

export default JSONViewerModal;
