'use client';

import React, { useEffect, useState } from 'react';
import { createForm, Field } from '@formily/core';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  Password,
  Cascader,
  DatePicker,
  Submit,
  Space,
  Switch,
  FormGrid,
  Upload,
  ArrayItems,
  Editable,
  FormButtonGroup,
  IUploadProps,
} from '@formily/antd-v5';
import { action } from '@formily/reactive';
import { Card, Button } from 'antd';
import { AiOutlineUpload } from 'react-icons/ai';
import { transferStandardJSONSchemaToFormilyJSONSchema } from '@/utils/json-schema';

const form = createForm({
  validateFirst: true,
});

const IDUpload = (props: React.PropsWithChildren<IUploadProps>) => {
  return (
    <Upload
      {...props}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      headers={{
        authorization: 'authorization-text',
      }}
    >
      <Button icon={<AiOutlineUpload />}>上传复印件</Button>
    </Upload>
  );
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    NumberPicker,
    Switch,
    DatePicker,
    Cascader,
    Select,
    Password,
    IDUpload,
    Space,
    ArrayItems,
    Editable,
  },
  scope: {
    fetchAddress: (field: Field) => {
      const transform = (data: Record<string, any> = {}) => {
        return Object.entries(data).reduce((buf, [key, value]) => {
          if (typeof value === 'string')
            return buf.concat({
              label: value,
              value: key,
            });
          const { name, code, cities, districts } = value;
          const _cities: any = transform(cities);
          const _districts: any = transform(districts);
          return buf.concat({
            label: name,
            value: code,
            children: _cities.length ? _cities : _districts.length ? _districts : undefined,
          });
        }, new Array<any>());
      };

      field.loading = true;
      fetch('https://unpkg.com/china-location/dist/location.json')
        .then((res) => res.json())
        .then(
          action.bound?.((data) => {
            field.dataSource = transform(data);
            field.loading = false;
          })
        );
    },
  },
});

const originJSONSchema = {
  $defs: {
    OpenAIBackendConfigTemp: {
      properties: {
        model: {
          enum: [
            'babbage-002',
            'davinci-002',
            'gpt-3.5-turbo-instruct',
            'text-davinci-003',
            'text-davinci-002',
            'text-davinci-001',
            'code-davinci-002',
            'text-curie-001',
            'text-babbage-001',
            'text-ada-001',
            'gpt-4-1106-preview',
            'gpt-4-vision-preview',
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-0613',
            'gpt-4-32k',
            'gpt-4-32k-0314',
            'gpt-4-32k-0613',
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-0301',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-16k-0613',
          ],
          title: 'Model',
          type: 'string',
        },
        api_key: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Api Key',
        },
        organization: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Organization',
        },
        base_url: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Base Url',
        },
        azure_endpoint: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Azure Endpoint',
        },
        azure_deployment: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Azure Deployment',
        },
        api_version: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
          default: null,
          title: 'Api Version',
        },
        is_azure: {
          default: false,
          title: 'Is Azure',
          type: 'boolean',
        },
        max_retries: {
          default: 2,
          title: 'Max Retries',
          type: 'integer',
        },
        timeout: {
          default: 60,
          title: 'Timeout',
          type: 'number',
        },
      },
      required: ['model'],
      title: 'OpenAIBackendConfigTemp',
      type: 'object',
    },
    ProfileTemp: {
      properties: {
        name: {
          title: 'Name',
          type: 'string',
        },
      },
      required: ['name'],
      title: 'ProfileTemp',
      type: 'object',
    },
  },
  properties: {
    profile: {
      $ref: '#/$defs/ProfileTemp',
    },
    ai_backend_config: {
      $ref: '#/$defs/OpenAIBackendConfigTemp',
    },
  },
  required: ['profile', 'ai_backend_config'],
  title: 'OpenAIBasicExamineeConfigTemp',
  type: 'object',
};

const FormilyJSONSchemaTestPage = () => {
  const [formilySchema, setFormilySchema] = useState<any>();

  const processSchema = async () => {
    const deRefSchema = await transferStandardJSONSchemaToFormilyJSONSchema(originJSONSchema);
    setFormilySchema(deRefSchema);
  };

  useEffect(() => {
    processSchema();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        background: '#eee',
        padding: '40px 0',
      }}
    >
      {formilySchema && (
        <Card style={{ width: 620 }}>
          <Form form={form} labelCol={5} wrapperCol={16} onAutoSubmit={console.log}>
            <SchemaField schema={formilySchema} />
            <FormButtonGroup.FormItem>
              <Submit block size="large">
                Submit
              </Submit>
            </FormButtonGroup.FormItem>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default FormilyJSONSchemaTestPage;
