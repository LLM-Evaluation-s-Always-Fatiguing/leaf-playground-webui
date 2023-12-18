import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import { SystemTransformationUnits } from './transformation-units';
import cloneDeep from 'lodash/cloneDeep';
import { Resolver } from '@stoplight/json-ref-resolver';
import { TransformationUnit, TransformCore } from './transformation-unit-defs';
import SampleJSONSchema from '@/types/SampleJSONSchema';

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
