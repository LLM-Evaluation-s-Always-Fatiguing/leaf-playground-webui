'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import SceneAgentConfig, { SceneAgentDefinition } from '@/types/server/Agent';
import { Form } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';

interface CreateOrUpdateAgentModalProps {
  open: boolean;
  sceneAgentConfig?: SceneAgentConfig;
  sceneAgentDefinition?: SceneAgentDefinition;
  onSubmit: (sceneAgent: SceneAgentConfig) => void;
  onNeedClose: () => void;
}

const CreateOrUpdateAgentModal: React.FC<CreateOrUpdateAgentModalProps> = ({
  open,
  sceneAgentConfig,
  sceneAgentDefinition,
  onSubmit,
  onNeedClose,
}) => {
  const [form, setForm] = useState(
    createForm({
      validateFirst: true,
    })
  );
  const [modalLoading, setModalLoading] = useState(false);

  const resetState = () => {
    setModalLoading(false);
    const newForm = createForm({
      validateFirst: true,
      initialValues: sceneAgentConfig?.agent_config_data || {},
    });
    setForm(newForm);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const onConfirm = async () => {
    if (!sceneAgentDefinition) return;
    try {
      await form.validate();
      const formValues = form.values;
      onSubmit({
        agent_id: sceneAgentDefinition?.agent_id,
        agent_config_data: form.values,
      });
      console.log(formValues);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      title={`${sceneAgentConfig ? 'Edit' : 'Create'} Agent`}
      open={open}
      width={640}
      destroyOnClose
      okText={sceneAgentConfig ? 'Save' : 'Create'}
      onOk={() => {
        onConfirm();
      }}
      onCancel={() => {
        onNeedClose();
      }}
    >
      <Spin spinning={modalLoading}>
        <Form form={form} labelCol={6}>
          <FormilyDefaultSchemaField schema={sceneAgentDefinition?.schema} />
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateOrUpdateAgentModal;
