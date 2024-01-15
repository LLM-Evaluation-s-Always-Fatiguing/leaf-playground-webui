import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import merge from 'lodash/merge';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractBasicTransformationUnit } from '../../transformation-unit-defs';

export default class BasicAllOfTransformationUnit extends AbstractBasicTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return !schema.type && schema.allOf;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema.allOf.forEach((s: any) => {
      merge(schema, s);
    });
    if (!schema.type && schema.const) {
      schema.type = typeof schema.const;
    }
    rootTransform(schema, level, rootTransform);
  }
}
