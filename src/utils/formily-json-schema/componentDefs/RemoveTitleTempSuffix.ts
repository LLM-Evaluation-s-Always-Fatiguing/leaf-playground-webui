import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import type { TransformCore } from '../formily-schema';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';

const transformedMark = 'RemoveTitleTempSuffix';

export class RemoveTitleTempSuffixDef extends AbstractComponentDef {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return !!schema.title && !(schema.transformedBy || []).includes(transformedMark);
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema.title = schema.title.replace(/(Temp)+$/, '');
    if (!Array.isArray(schema.transformedBy)) {
      schema.transformedBy = [];
    }
    schema.transformedBy.push(transformedMark);
    rootTransform(schema, level, rootTransform);
  }
}
