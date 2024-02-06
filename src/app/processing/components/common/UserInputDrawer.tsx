'use client';

import React, { useEffect, useState } from 'react';
import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import { Button, Drawer, Space, Spin } from 'antd';
import { Form } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';

interface UserInputDrawerProps {
  open: boolean;
  schema?: FormilyJSONSchema;
  onSubmit: (data: any) => void;
  onNeedClose: () => void;
}

const UserInputDrawer: React.FC<UserInputDrawerProps> = ({ open, schema, onSubmit, onNeedClose }) => {
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
    });
    setForm(newForm);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const onConfirm = async () => {
    try {
      await form.validate();
      onSubmit(form.values);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Drawer
      title={`${schema?.title || 'User Input'}`}
      open={open}
      destroyOnClose
      placement={'bottom'}
      styles={{
        body: {
          overflow: 'hidden auto',
        },
      }}
      extra={
        <Space>
          <Button onClick={onNeedClose}>Later</Button>
          <Button type="primary" onClick={onConfirm}>
            Submit
          </Button>
        </Space>
      }
      onClose={() => {
        onNeedClose();
      }}
    >
      <Spin spinning={modalLoading}>
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <Form
            style={{
              width: 'min(65%, 860px)',
              position: 'relative',
              left: '-5%'
            }}
            form={form}
            labelCol={6}
          >
            <FormilyDefaultSchemaField schema={schema} />
          </Form>
        </div>
      </Spin>
    </Drawer>
  );
};

export default UserInputDrawer;
