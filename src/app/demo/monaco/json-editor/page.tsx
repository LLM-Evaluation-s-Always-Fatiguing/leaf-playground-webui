'use client';

import React, { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

export default function MonacoJSONEditor() {
  const monacoRef = useRef<Monaco>();

  function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemas: [
        {
          uri: 'http://myserver/foo-schema.json', // id of the first schema
          fileMatch: ['*'], // associate with our model
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                title: '用户名',
                required: true,
                minLength: 1,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
              password: {
                type: 'string',
                title: '密码',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Password',
                'x-component-props': {
                  checkStrength: true,
                },
                'x-reactions': [
                  {
                    dependencies: ['.confirm_password'],
                    fulfill: {
                      state: {
                        selfErrors: '{{$deps[0] && $self.value && $self.value !== $deps[0] ? "确认密码不匹配" : ""}}',
                      },
                    },
                  },
                ],
              },
              confirm_password: {
                type: 'string',
                title: '确认密码',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Password',
                'x-component-props': {
                  checkStrength: true,
                },
                'x-reactions': [
                  {
                    dependencies: ['.password'],
                    fulfill: {
                      state: {
                        selfErrors: '{{$deps[0] && $self.value && $self.value !== $deps[0] ? "确认密码不匹配" : ""}}',
                      },
                    },
                  },
                ],
              },
              name: {
                type: 'void',
                title: '姓名',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: true,
                  feedbackLayout: 'none',
                },
                'x-component': 'FormGrid',
                properties: {
                  firstName: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: '姓',
                    },
                  },
                  lastName: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: '名',
                    },
                  },
                },
              },
              email: {
                type: 'string',
                title: '邮箱',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-validator': 'email',
              },
              gender: {
                type: 'string',
                title: '性别',
                enum: [
                  {
                    label: '男',
                    value: 1,
                  },
                  {
                    label: '女',
                    value: 2,
                  },
                  {
                    label: '第三性别',
                    value: 3,
                  },
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Select',
              },
              birthday: {
                type: 'string',
                required: true,
                title: '生日',
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
              },
              address: {
                type: 'string',
                required: true,
                title: '地址',
                'x-decorator': 'FormItem',
                'x-component': 'Cascader',
                'x-reactions': '{{fetchAddress}}',
              },
              idCard: {
                type: 'string',
                required: true,
                title: '身份证复印件',
                'x-decorator': 'FormItem',
                'x-component': 'IDUpload',
              },
              contacts: {
                type: 'array',
                required: true,
                title: '联系人信息',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems',
                items: {
                  type: 'object',
                  'x-component': 'ArrayItems.Item',
                  properties: {
                    name: {
                      type: 'string',
                      title: '姓名',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-component-props': {
                        style: {
                          width: 300,
                        },
                      },
                    },
                    email: {
                      type: 'string',
                      title: '邮箱',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-validator': [{ required: true }, 'email'],
                      'x-component-props': {
                        style: {
                          width: 300,
                        },
                      },
                    },
                    phone: {
                      type: 'string',
                      title: '手机号',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-validator': [{ required: true }, 'phone'],
                      'x-component-props': {
                        style: {
                          width: 300,
                        },
                      },
                    },
                  },
                  required: ['name'],
                },
                properties: {
                  addition: {
                    type: 'void',
                    title: '新增联系人',
                    'x-component': 'ArrayItems.Addition',
                  },
                },
              },
            },
            required: [
              'username',
              'password',
              'confirm_password',
              'firstName',
              'lastName',
              'email',
              'birthday',
              'address',
              'idCard',
              'contacts',
            ],
          },
        },
      ],
    });
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    monacoRef.current = monaco;
  }

  return (
    <Editor
      height="90vh"
      defaultLanguage="json"
      theme={'vs-dark'}
      defaultValue={JSON.stringify(
        {
          username: 'user359',
          password: 'Password123!',
          confirm_password: 'Password123!',
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
          email: 'johndoe@example.com',
          gender: 3,
          birthday: '2023-11-17',
          address: '1234 Main Street',
          idCard: 'AB1234567890',
          contacts: [
            {
              name: 'Jane Doe',
              email: 'janedoe@example.com',
              phone: '555-1234',
            },
            {
              phone: '555-1234',
            },
          ],
        },
        null,
        2
      )}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
    />
  );
}
