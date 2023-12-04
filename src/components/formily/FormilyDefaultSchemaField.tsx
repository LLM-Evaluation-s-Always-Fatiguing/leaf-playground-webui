'use client';

import { createSchemaField } from '@formily/react';
import {
  ArrayItems,
  ArrayTabs,
  DatePicker,
  Editable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  Radio,
  Checkbox,
  Space,
  Switch,
} from '@formily/antd-v5';
import { Card, Flex, Input as AntdInput } from 'antd';
import ColorPicker from '@/components/formily/ColorPicker';

const NoConfigRequired = () => {
  return (
    <AntdInput
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
      value={'No manual config required.'}
      readOnly
      bordered={false}
    />
  );
};

const FormilyDefaultSchemaField = createSchemaField({
  components: {
    ArrayItems,
    ArrayTabs,
    DatePicker,
    Editable,
    FormGrid,
    FormItem,
    FormLayout,
    Input,
    NumberPicker,
    Select,
    Radio,
    Checkbox,
    Space,
    Switch,

    Card,
    Flex,

    NoConfigRequired,

    ColorPicker,
  },
});

export default FormilyDefaultSchemaField;
