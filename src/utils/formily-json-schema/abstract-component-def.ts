import FormilyJSONSchema from "@/types/FormilyJSONSchema";
import {ComponentDef, TransformCore} from "@/utils/formily-json-schema/formily-schema";

export abstract class AbstractComponentDef implements ComponentDef {
    abstract transformCore(schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): void;

    abstract shouldTransform(schema: FormilyJSONSchema, level: number): boolean;

    transform = (schema: FormilyJSONSchema, level: number, rootTransform: TransformCore): boolean => {
        if (this.shouldTransform(schema, level)) {
            this.transformCore(schema, level, rootTransform);
            return true;
        } else {
            return false;
        }
    }
}
