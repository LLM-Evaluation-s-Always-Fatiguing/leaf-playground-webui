import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractSpecializedTransformationUnit } from '../../transformation-unit-defs';

export default class MultiTypeAnyOfTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    if (schema.anyOf && schema.anyOf.length) {
      const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
      return noNullAnyOf.length > 1;
    }
    return false;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
    const canBeNull = schema.anyOf.length > noNullAnyOf.length;
    schema['x-decorator'] = 'Card';
    schema['x-decorator-props'] = {
      title: schema.title,
      size: 'small',
      style: {
        boxShadow: 'none',
        marginBottom: '16px',
      },
      headStyle: {
        border: 'none',
      },
    };
    schema['x-component'] = 'MultiTypeItem';
    noNullAnyOf.forEach((s: FormilyJSONSchema) => {
      rootTransform(s, level, rootTransform);
    });
    delete schema.anyOf
    schema['x-component-props'] = {
      nullable: canBeNull,
      options: noNullAnyOf,
    };
  }
}
