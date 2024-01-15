import FormilyJSONSchema from '@/types/common/FormilyJSONSchema';
import SampleJSONSchema from '@/types/common/SampleJSONSchema';
import { Resolver } from '@stoplight/json-ref-resolver';
import cloneDeep from 'lodash/cloneDeep';
import { TransformCore, TransformationUnit } from './transformation-unit-defs';
import { SystemTransformationUnits } from './transformation-units';

export default class FormilySchemaTransformer {
  private transformationUnits: TransformationUnit[];
  private jsonRefResolver: Resolver = new Resolver();

  constructor(customTransformationUnits: TransformationUnit[] = []) {
    const defaultUnits: TransformationUnit[] = SystemTransformationUnits;
    this.transformationUnits = [...customTransformationUnits, ...defaultUnits];
  }

  private transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    this.transformationUnits.some((componentDef: TransformationUnit) => {
      return componentDef.transform(schema, level, rootTransform);
    });
  }

  private async deref(schema: FormilyJSONSchema): Promise<SampleJSONSchema> {
    const result = cloneDeep((await this.jsonRefResolver.resolve(schema)).result);
    delete result.$defs;
    return result;
  }

  async transform(schema: FormilyJSONSchema): Promise<{
    derefSchema: SampleJSONSchema;
    formilySchema: FormilyJSONSchema;
  }> {
    const derefSchema = await this.deref(schema);
    const formilySchema: FormilyJSONSchema = cloneDeep(derefSchema) as any;

    const transformCore = this.transformCore.bind(this);
    this.transformCore(formilySchema, 0, transformCore);

    return { derefSchema, formilySchema };
  }
}
