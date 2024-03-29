'use client';

import React, { useEffect, useState } from 'react';
import SceneAgentConfig from '@/types/server/config/Agent';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import { Spin, message } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm, onFormValuesChange } from '@formily/core';
import cloneDeep from 'lodash/cloneDeep';
import CustomScrollableAntdModal from '@/components/basic/CustomScrollableAntdModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import { getRandomAgentColor } from '@/utils/color';

const getRandomIdSuffix = () => Math.random().toString(16).substring(6, 10);

interface CreateOrUpdateAgentModalProps {
  open: boolean;
  sceneAgentConfig?: SceneAgentConfig;
  operatingAgentMetadata?: SceneAgentMetadata;
  allAgentNames: string[];
  allAgentColors: string[];
  onSubmit: (sceneAgent: SceneAgentConfig) => void;
  onNeedClose: () => void;
}

const CreateOrUpdateAgentModal: React.FC<CreateOrUpdateAgentModalProps> = ({
  open,
  sceneAgentConfig,
  operatingAgentMetadata,
  allAgentNames,
  allAgentColors,
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
      initialValues:
        sceneAgentConfig?.config_data ||
        ({
          profile: {
            id: `agent_${getRandomIdSuffix()}`,
          },
          chart_major_color: getRandomAgentColor(allAgentColors),
        } as any),
      effects() {
        onFormValuesChange((form) => {
          const currentValues = form.values;
          const oldId = currentValues?.profile?.id;
          let uuid = getRandomIdSuffix();
          if (oldId && oldId.split('_').length > 1) {
            const splitId = oldId.split('_');
            uuid = splitId[splitId.length - 1];
          }
          currentValues.profile.id = `${(currentValues?.profile?.name || 'agent').trim().replace(/\s+/g, '_')}_${uuid}`;
        });
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
    if (!operatingAgentMetadata) return;
    try {
      await form.validate();
      const newName = form.values.profile.name.trim();
      const formData = cloneDeep(form.values);
      console.log(formData);
      formData.profile.name = newName;
      if (sceneAgentConfig?.config_data.profile.name !== newName && allAgentNames.includes(newName)) {
        message.error('Agent name already exists');
        return;
      }
      onSubmit({
        obj_for_import: operatingAgentMetadata?.obj_for_import,
        config_data: formData,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CustomScrollableAntdModal
      title={`${sceneAgentConfig ? 'Edit' : 'Create'} Agent （${operatingAgentMetadata?.cls_name}）`}
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
          <FormilyDefaultSchemaField schema={operatingAgentMetadata?.configSchema} />
        </Form>
      </Spin>
    </CustomScrollableAntdModal>
  );
};

export default CreateOrUpdateAgentModal;
