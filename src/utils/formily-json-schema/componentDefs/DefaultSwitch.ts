import FormilyJSONSchema from "@/types/FormilyJSONSchema";
import type {TransformCore} from "../formily-schema"
import {AbstractComponentDef} from "@/utils/formily-json-schema/abstract-component-def";

export class DefaultSwitchComponentDef extends AbstractComponentDef {
    shouldTransform(schema: FormilyJSONSchema, level: number): boolean {
        return schema.type == "boolean";
    }

    transformCore(schema: FormilyJSONSchema, level: number, rootTransform?: TransformCore | undefined): void {
        schema['x-decorator'] = 'FormItem';
        schema['x-component'] = 'Switch';
    }
}
