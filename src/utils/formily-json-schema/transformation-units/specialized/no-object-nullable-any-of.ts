import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import type { TransformCore } from '../../transformation-unit-defs';
import { AbstractSpecializedTransformationUnit } from '../../transformation-unit-defs';

export default class NoObjectNullableAnyOfTransformationUnit extends AbstractSpecializedTransformationUnit {
  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    if (schema.anyOf && schema.anyOf.length) {
      const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
      switch (noNullAnyOf.length) {
        case 1:
          if (noNullAnyOf[0].type !== 'object') return true;
          break;
        default:
          break;
      }
    }
    return false;
  }

  transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    const noNullAnyOf = schema.anyOf.filter((item: any) => item.type !== 'null');
    Object.assign(schema, noNullAnyOf[0]);
    delete schema.anyOf;
    rootTransform(schema, level, rootTransform);
  }
}
