import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import { AbstractSpecializedTransformationUnit, TransformCore } from '../../transformation-unit-defs';

export default class LongStringTextViewTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return schema.type == 'string' && schema['lf-component'] && schema['lf-component'] === 'long-text';
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    schema['x-decorator'] = 'FormItem';
    schema['x-component'] = 'Input.TextArea';
    schema['x-component-props'] = {
      autoSize: {
        minRows: 2,
      },
      showCount: true,
    };
  }
}
