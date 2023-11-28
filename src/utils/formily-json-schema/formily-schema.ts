import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import { JSXComponent } from '@formily/react/esm/types';
import { SystemComponentDefs } from './componentDefs';
import cloneDeep from 'lodash/cloneDeep';
import { Resolver } from '@stoplight/json-ref-resolver';
import { AbstractComponentDef } from '@/utils/formily-json-schema/abstract-component-def';

export type IsTransformed = boolean;

/**
 * Transform JSON Schema to Formily Schema
 * @param schema Original JSON Schema which will be directly transformed in place
 * @param level Current level of the node(Top level is 0)
 * @param rootTransform Root transform function, used to transform child nodes if needed
 */
export type TransformCore = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore) => void;

/**
 * Whether the node needs to be transformed
 */
export type ShouldTransform = (schema: FormilyJSONSchema, level: number) => boolean;

export interface ComponentDef {
  transform: (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore) => IsTransformed;
  transformCore: TransformCore;
  shouldTransform: ShouldTransform;
}

export class CustomComponentDef extends AbstractComponentDef {
  private readonly _component: JSXComponent;
  private readonly _transform: TransformCore;
  private readonly _shouldTransform: ShouldTransform;

  constructor(component: JSXComponent, transform: TransformCore, shouldTransform: ShouldTransform) {
    super();
    this._component = component;
    this._transform = transform;
    this._shouldTransform = shouldTransform;
  }

  get component(): JSXComponent {
    return this._component;
  }

  transformCore = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void => {
    this._transform(schema, level, rootTransform);
  };

  shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
    return this._shouldTransform(schema, level);
  }
}

export class FormilySchemaTransformer {
  private componentDefs: ComponentDef[];
  private resolver: Resolver = new Resolver();

  constructor(customComponentDefs: ComponentDef[] = []) {
    const defaultFallback: ComponentDef[] = SystemComponentDefs;

    this.componentDefs = [...customComponentDefs, ...defaultFallback];
  }

  private transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void {
    this.componentDefs.some((componentDef: ComponentDef) => {
      return componentDef.transform(schema, level, rootTransform);
    });
  }

  private async deref(schema: FormilyJSONSchema): Promise<FormilyJSONSchema> {
    const resolved = await this.resolver.resolve(schema);
    return resolved.result;
  }

  async transform(schema: FormilyJSONSchema): Promise<FormilyJSONSchema> {
    const derefedSchema = cloneDeep(await this.deref(schema));
    const transformCore = this.transformCore.bind(this);
    this.transformCore(derefedSchema, 0, transformCore);
    return derefedSchema;
  }
}
