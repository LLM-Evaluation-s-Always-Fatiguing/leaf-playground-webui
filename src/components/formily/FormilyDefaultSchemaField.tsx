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
  Space,
  Switch,
} from '@formily/antd-v5';
import { Card, Flex } from 'antd';

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
    Space,
    Switch,
    Card,
    Flex,
  },
});

export default FormilyDefaultSchemaField;
