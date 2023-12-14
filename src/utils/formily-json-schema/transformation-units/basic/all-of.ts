import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractBasicTransformationUnit } from "../../transformation-unit-defs";
import merge from 'lodash/merge';

export class BasicAllOfTransformationUnit extends AbstractBasicTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return !schema.type && schema.allOf;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema.allOf.forEach((s: any) => {
      merge(schema, s);
    });
    if (!schema.type && schema.const) {
      schema.type = typeof schema.const
    }
    rootTransform(schema, level, rootTransform);
  }
}
