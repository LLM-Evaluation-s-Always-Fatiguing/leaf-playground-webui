import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Checkbox } from 'antd';
import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';
import { useField, useForm, observer } from '@formily/react';
import { ObjectField } from '@formily/core';
import { FormItem } from '@formily/antd-v5';

interface NullableObjectProps extends PropsWithChildren {
  label?: string;
  childSchema?: FormilyJSONSchema;
}

const NullableObject = observer((props: NullableObjectProps) => {
  const [enable, setEnable] = useState(false);
  const form = useForm();
  const field = useField<ObjectField>();

  const setChildFieldDisplay = (enable: boolean, validate = false) => {
    if (props.childSchema) {
      form.query(`${field.address.entire}.*`).forEach((subField) => {
        subField.setDisplay(enable ? 'visible' : 'hidden');
        field.setValue(undefined);
      });
      setTimeout(() => {
        if (validate) {
          form.validate();
        }
      }, 0);
    }
  };

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) return;
    setChildFieldDisplay(enable, true);
  }, [enable]);

  useEffect(() => {
    mountedRef.current = true;
    setChildFieldDisplay(enable);
    return ()=>{
      mountedRef.current = false;
    }
  }, []);

  return (
    <FormItem
      label={
        <Checkbox
          checked={enable}
          onChange={(e) => {
            setEnable(e.target.checked);
          }}
        >
          {props.label}
        </Checkbox>
      }
      asterisk={false}
    >
      {!enable && 'Nullable config check to enable.'}
      {enable && <FormilyDefaultSchemaField required={false} schema={props.childSchema} />}
    </FormItem>
  );
});

export default NullableObject;
