"use client";

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
  Space,
  Switch,
} from '@formily/antd-v5';
import { Card, Flex } from 'antd';

const FormilyDefaultSchemaField = createSchemaField({
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    ArrayItems,
    ArrayTabs,
    Input,
    NumberPicker,
    Switch,
    DatePicker,
    Select,
    Editable,
    Card,
    Space,
    Flex,
  },
});

export default FormilyDefaultSchemaField;
