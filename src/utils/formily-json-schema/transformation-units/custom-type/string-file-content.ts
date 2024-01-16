import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import { AbstractSpecializedTransformationUnit, TransformCore } from '../../transformation-unit-defs';

export default class UploadStringFileContentTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'string' && schema['lf-component'] && schema['lf-component'] === 'file-content';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'UploadStringFileContent';
  }
}
