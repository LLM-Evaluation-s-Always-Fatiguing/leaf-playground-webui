import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import { AbstractPreprocessorTransformationUnit, TransformCore } from '../../transformation-unit-defs';

export default class RemoveTitleTempSuffixPreprocessor extends AbstractPreprocessorTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return !!schema.title;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema.title = schema.title.replace(/(Temp)+$/, '');
  }
}
