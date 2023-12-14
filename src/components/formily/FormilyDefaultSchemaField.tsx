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
import { Card, Flex } from 'antd';
import NoConfigRequired from "@/components/formily/components/NoConfigRequired";
import ColorPicker from "@/components/formily/components/ColorPicker";
import NullableObject from "@/components/formily/components/NullableObject";

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
