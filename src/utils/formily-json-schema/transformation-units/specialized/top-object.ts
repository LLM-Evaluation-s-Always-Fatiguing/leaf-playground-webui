import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractSpecializedTransformationUnit } from '../../transformation-unit-defs';

export default class TopObjectTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'object' && level == 0;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    let required: string[] = [];
    if (Array.isArray(schema.required)) {
      required = schema.required;
    }

    schema['x-decorator'] = 'Card';
    schema['x-decorator-props'] = {
      title: schema.title,
      size: 'large', // TODO: for testing
      bordered: false,
      style: {
        boxShadow: 'none',
        marginBottom: '16px',
      },
      headStyle: {
        border: 'none',
      },
    };
    if (schema.properties) {
      if (Object.keys(schema.properties).length) {
        Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
          rootTransform(property, level + 1, rootTransform);
          if (required.includes(key) && property.type !== 'object') {
            property.required = true;
          }
        });
      } else {
        schema.default = {};
      }
    }
  }
}
