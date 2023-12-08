'use client';

import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import SceneAgentConfig, { SceneAgentDefinition } from '@/types/server/Agent';
import { Form } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import { getRandomAgentColor } from '@/utils/color';
import CustomScrollableAntdModal from '@/components/basic/CustomScrollableAntdModal';

interface CreateOrUpdateAgentModalProps {
  open: boolean;
  sceneAgentConfig?: SceneAgentConfig;
  sceneAgentDefinition?: SceneAgentDefinition;
  otherAgentConfigs: SceneAgentConfig[];
  onSubmit: (sceneAgent: SceneAgentConfig) => void;
  onNeedClose: () => void;
}

const CreateOrUpdateAgentModal: React.FC<CreateOrUpdateAgentModalProps> = ({
  open,
  sceneAgentConfig,
  sceneAgentDefinition,
  otherAgentConfigs,
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
      initialValues: sceneAgentConfig?.agent_config_data || {
        chart_major_color: getRandomAgentColor(
          otherAgentConfigs.map((c) => c.agent_config_data.chart_major_color!)
        ),
      },
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
      onSubmit({
        agent_id: sceneAgentDefinition?.agent_id,
        agent_config_data: form.values,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CustomScrollableAntdModal
      title={`${sceneAgentConfig ? 'Edit' : 'Create'} Agent （${sceneAgentDefinition?.name}）`}
      open={open}
      width={640}
      destroyOnClose
      centered
      styles={{
        body: {
          maxHeight: '80vh',
          overflow: 'hidden auto',
        },
      }}
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
    </CustomScrollableAntdModal>
  );
};

export default CreateOrUpdateAgentModal;
