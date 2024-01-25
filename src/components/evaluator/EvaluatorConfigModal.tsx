'use client';

import React, { useEffect, useState } from 'react';
import { MetricEvaluatorObjConfig } from '@/types/server/config/Evaluator';
import EvaluatorMetadata from '@/types/server/meta/Evaluator';
import { Spin } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import CustomScrollableAntdModal from '@/components/basic/CustomScrollableAntdModal';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';

interface EvaluatorConfigModalProps {
  open: boolean;
  metadata?: EvaluatorMetadata;
  config?: MetricEvaluatorObjConfig;
  onSubmit: (metadata: EvaluatorMetadata, config: MetricEvaluatorObjConfig) => void;
  onNeedClose: () => void;
}

const EvaluatorConfigModal: React.FC<EvaluatorConfigModalProps> = ({
  open,
  metadata,
  config,
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
      initialValues: config?.evaluator_config_data,
    });
    setForm(newForm);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const onConfirm = async () => {
    if (!metadata) return;
    try {
      await form.validate();
      onSubmit(metadata, {
        evaluator_obj: metadata?.obj_for_import,
        evaluator_config_data: form.values,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CustomScrollableAntdModal
      title={`${metadata?.cls_name} Config`}
      open={open}
      width={960}
      destroyOnClose
      centered
      styles={{
        body: {
          maxHeight: '80vh',
          overflow: 'hidden auto',
        },
      }}
      okText={'Save'}
      onOk={() => {
        onConfirm();
      }}
      onCancel={() => {
        onNeedClose();
      }}
    >
      <Spin spinning={modalLoading}>
        <Form form={form} labelCol={6}>
          <FormilyDefaultSchemaField schema={metadata?.configSchema} />
        </Form>
      </Spin>
    </CustomScrollableAntdModal>
  );
};

export default EvaluatorConfigModal;
