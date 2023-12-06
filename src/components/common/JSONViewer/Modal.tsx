'use client';

import React, { useEffect } from 'react';
import JSONViewer from '@/components/common/JSONViewer/index';
import CustomScrollableAntdModal from '@/components/basic/CustomScrollableAntdModal';

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
    <CustomScrollableAntdModal
      open={open}
      width={680}
      destroyOnClose
      centered
      styles={{
        body: {
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
    </CustomScrollableAntdModal>
  );
};

export default JSONViewerModal;
