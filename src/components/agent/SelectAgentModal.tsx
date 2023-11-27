'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Spin, Form, FormInstance } from 'antd';
import { SceneAgentDefinition } from '@/types/server/Agent';
import { Select } from '@formily/antd-v5';
import FormilyJSONSchema from "@/types/FormilyJSONSchema";

interface SelectAgentModalProps {
  open: boolean;
  agentsConfigFormilySchemas: Record<string, FormilyJSONSchema>;
  onSubmit: (agentDefinition: SceneAgentDefinition) => void;
  onNeedClose: () => void;
}

const SelectAgentModal: React.FC<SelectAgentModalProps> = ({
  open,
  agentsConfigFormilySchemas,
  onSubmit,
  onNeedClose,
}) => {
  const formRef = useRef<FormInstance>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const selectableAgentOptions = useMemo(() => {
    return Object.entries(agentsConfigFormilySchemas).map(([key, agentSchema]) => {
      return {
        label: agentSchema.title,
        value: key,
      };
    });
  }, [agentsConfigFormilySchemas]);

  const resetState = () => {
    setModalLoading(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const onFormFinish = async (formData: { agent_id: string }) => {
    const schema = agentsConfigFormilySchemas[formData.agent_id];
    onSubmit({
      agent_id: formData.agent_id,
      name: schema.title,
      schema: schema,
    });
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
        <Form<{ agent_id: string }>
          layout={'horizontal'}
          preserve={false}
          ref={formRef}
          labelCol={{ span: 4 }}
          onFinish={onFormFinish}
        >
          <Form.Item
            label={'Agent'}
            name={'agent_id'}
            required
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select options={selectableAgentOptions} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SelectAgentModal;
