import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../formily-schema';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';

export class DefaultNumberComponentDef extends AbstractComponentDef {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'integer' || schema.type == 'number';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore | undefined): void {
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'NumberPicker';
  }
}
