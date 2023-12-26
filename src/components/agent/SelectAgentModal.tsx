'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import { Form, FormInstance, Modal, Spin } from 'antd';
import { Select } from '@formily/antd-v5';

interface SelectAgentModalProps {
  open: boolean;
  selectableAgentsMetadata: SceneAgentMetadata[];
  onSubmit: (agentMetadata: SceneAgentMetadata) => void;
  onNeedClose: () => void;
}

const SelectAgentModal: React.FC<SelectAgentModalProps> = ({
  open,
  selectableAgentsMetadata,
  onSubmit,
  onNeedClose,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const selectableAgentOptions = useMemo(() => {
    return selectableAgentsMetadata.map((metadata) => {
      return {
        label: metadata.cls_name,
        value: metadata.cls_name,
      };
    });
  }, [selectableAgentsMetadata]);

  const resetState = () => {
    setModalLoading(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const onFormFinish = async (formData: { cls_name: string }) => {
    const metadata = selectableAgentsMetadata.find((m) => m.cls_name === formData.cls_name);
    if (metadata) {
      onSubmit(metadata);
    }
  };

  return (
    <Modal
      open={open}
      width={640}
      destroyOnClose
      styles={{
        body: {
          padding: '30px 0 10px 0',
        },
      }}
      okText={'Confirm'}
      onOk={() => {
        formRef.current?.submit();
      }}
      onCancel={() => {
        onNeedClose();
      }}
      title={'Choose Agent'}
    >
      <Spin spinning={modalLoading}>
        <Form<{ cls_name: string }>
          layout={'horizontal'}
          preserve={false}
          ref={formRef}
          labelCol={{ span: 4 }}
          onFinish={onFormFinish}
        >
          <Form.Item
            label={'Agent'}
            name={'cls_name'}
            required
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select options={selectableAgentOptions} />
          </Form.Item>
          <Form.Item label={' '} colon={false} dependencies={['cls_name']}>
            {() => {
              const cls_name = formRef.current?.getFieldValue('cls_name');
              const currentAgentMetadata = selectableAgentsMetadata.find((m) => m.cls_name === cls_name);
              if (currentAgentMetadata) {
                return <div>{currentAgentMetadata.description}</div>;
              }
              return false;
            }}
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SelectAgentModal;
