import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractBasicTransformationUnit } from '../../transformation-unit-defs';

export default class BasicBooleanTransformationUnit extends AbstractBasicTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'boolean';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'Switch';
  }
}
