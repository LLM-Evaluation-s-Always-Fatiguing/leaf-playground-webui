import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractSpecializedTransformationUnit } from '../../transformation-unit-defs';

export default class ObjectNullableAnyOfTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    if (schema.anyOf && schema.anyOf.length) {
      const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
      switch (noNullAnyOf.length) {
        case 1:
          if (noNullAnyOf[0].type === 'object') return true;
          break;
        default:
          break;
      }
    }
    return false;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
    Object.assign(schema, noNullAnyOf[0]);
    delete schema.anyOf;
    let required: string[] = [];
    if (Array.isArray(schema.required)) {
      required = schema.required;
    }
    delete schema['x-decorator'];
    if (schema.properties) {
      if (Object.keys(schema.properties).length) {
        Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
          rootTransform!(property, level + 1, rootTransform);
          if (required.includes(key) && property.type !== 'object') {
            property.required = true;
          }
        });
      } else {
        schema.default = {};
      }
    }
    schema['x-component'] = 'NullableObject';
    schema['x-component-props'] = {
      label: schema.title,
      childSchema: { ...schema },
    };
    schema.properties = {};
  }
}
