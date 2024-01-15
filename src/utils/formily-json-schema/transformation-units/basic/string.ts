import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractBasicTransformationUnit } from '../../transformation-unit-defs';

export default class BasicStringTransformationUnit extends AbstractBasicTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'string';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['x-decorator'] = 'FormItem';
    if (schema.enum) {
      schema['x-component'] = 'Select';
      schema['x-component-props'] = {
        allowClear: schema.required !== true,
      };
    } else {
      schema['x-component'] = 'Input';
    }
  }
}
