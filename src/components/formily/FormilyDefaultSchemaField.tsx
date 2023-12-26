'use client';

import { Card, Flex } from 'antd';
import {
  ArrayItems,
  ArrayTabs,
  Checkbox,
  DatePicker,
  Editable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
  Space,
  Switch,
} from '@formily/antd-v5';
import { createSchemaField } from '@formily/react';
import ColorPicker from '@/components/formily/components/ColorPicker';
import NoConfigRequired from '@/components/formily/components/NoConfigRequired';
import NullableObject from '@/components/formily/components/NullableObject';

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

    NullableObject,

    NoConfigRequired,
    ColorPicker,
  },
});

export default FormilyDefaultSchemaField;
