import FormilyJSONSchema from "@/types/FormilyJSONSchema";
import type {TransformCore} from "../formily-schema"
import {AbstractComponentDef} from "@/utils/formily-json-schema/abstract-component-def";

export class DefaultInputComponentDef extends AbstractComponentDef {
    shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
        return schema.type == "string";
    }

    transformCore(schema: FormilyJSONSchema, level: number, rootTransform?: TransformCore | undefined): void {
      schema['x-decorator'] = 'FormItem';
        if (schema.enum) {
            schema['x-component'] = 'Select';
        } else {
            schema['x-component'] = 'Input';
        }

    }
}
