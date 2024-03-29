import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractSpecializedTransformationUnit } from '../../transformation-unit-defs';

export default class EmptyObjectNoConfigRequiredTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type === 'object' && Object.keys(schema.properties || {}).length === 0;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['default'] = {};
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'NoConfigRequired';
  }
}
