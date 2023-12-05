import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../formily-schema';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';
import merge from 'lodash/merge';

export class DefaultAllOfDef extends AbstractComponentDef {
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
    console.log(schema);
    rootTransform!(schema, level, rootTransform);
  }
}
