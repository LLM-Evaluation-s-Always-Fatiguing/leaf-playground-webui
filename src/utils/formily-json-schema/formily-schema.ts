import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import { SystemTransformationUnits } from './transformation-units';
import cloneDeep from 'lodash/cloneDeep';
import { Resolver } from '@stoplight/json-ref-resolver';
import { TransformationUnit, TransformCore } from './transformation-unit-defs';

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

  private async deref(schema: FormilyJSONSchema): Promise<
    FormilyJSONSchema & {
      $defs?: any;
    }
  > {
    const resolved = await this.jsonRefResolver.resolve(schema);
    return resolved.result;
  }

  async transform(schema: FormilyJSONSchema): Promise<FormilyJSONSchema> {
    const finalSchema = cloneDeep(await this.deref(schema));
    delete finalSchema.$defs;

    const transformCore = this.transformCore.bind(this);
    this.transformCore(finalSchema, 0, transformCore);

    return finalSchema;
  }
}
