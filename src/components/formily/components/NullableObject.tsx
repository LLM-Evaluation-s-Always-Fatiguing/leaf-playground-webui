import React, { PropsWithChildren, useEffect, useState } from 'react';
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

  const setChildFieldDisplay = (enable: boolean) => {
    if (props.childSchema) {
      Object.keys(props.childSchema.properties || {}).forEach((property) => {
        form.query(`${field.address.entire}.${property}`).forEach((subField) => {
          subField.setDisplay(enable ? 'visible' : 'hidden');
        });
      });
      setTimeout(() => {
        try {
          form.validate();
        } catch {}
      }, 0);
    }
  };

  useEffect(() => {
    setChildFieldDisplay(enable);
  }, [enable]);
  useEffect(() => {
    setChildFieldDisplay(enable);
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
      <FormilyDefaultSchemaField schema={props.childSchema} />
    </FormItem>
  );
});

export default NullableObject;
