import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../formily-schema';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';

export class RemoveTitleTempSuffixDef extends AbstractComponentDef {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return !!schema.title;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema.title = schema.title.replace(/(Temp)+$/, '');
  }

  transform = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): boolean => {
    if (this.shouldTransform(schema, level)) {
      this.transformCore(schema, level, rootTransform);
    }
    return false;
  };
}
