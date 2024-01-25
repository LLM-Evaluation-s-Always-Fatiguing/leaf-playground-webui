import React, { useEffect, useRef, useState } from 'react';
import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import { FormItem, Select } from '@formily/antd-v5';
import { ObjectField } from '@formily/core';
import { useField, useForm } from '@formily/react';
import styled from '@emotion/styled';
import FormilyDefaultSchemaField from '@/components/formily/FormilyDefaultSchemaField';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

interface MultiTypeItemProps {
  nullable: boolean;
  options: FormilyJSONSchema[];
}

const MultiTypeItem = (props: MultiTypeItemProps) => {
  const form = useForm();
  const field = useField<ObjectField>();

  const [currentType, setCurrentType] = useState(props.nullable ? -1 : 0);
  const hasSubForm = currentType >= 0;

  return (
    <Container>
      <FormItem label={'Type'}>
        <Select
          value={currentType}
          onChange={(newValue) => {
            form.query(`${field.address.entire}.*`).forEach((subField) => {
              subField.destroy(true);
            });
            field.setValue(undefined);
            setCurrentType(newValue);
          }}
          options={[
            ...(props.nullable ? [{ label: 'Null', value: -1 }] : []),
            ...props.options.map((o, index) => {
              return {
                label: o.title,
                value: index,
              };
            }),
          ]}
        />
      </FormItem>
      {hasSubForm && (
        <FormilyDefaultSchemaField
          key={props.options[currentType].title}
          required={false}
          schema={props.options[currentType]}
        />
      )}
    </Container>
  );
};

export default MultiTypeItem;
