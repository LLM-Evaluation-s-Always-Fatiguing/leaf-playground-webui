import {DefaultNumberComponentDef} from "@/utils/formily-json-schema/componentDefs/DefaultNumber";
import {DefaultSwitchComponentDef} from "@/utils/formily-json-schema/componentDefs/DefaultSwitch";
import {DefaultInputComponentDef} from "@/utils/formily-json-schema/componentDefs/DefaultInput";
import {DefaultArrayComponentDef} from "@/utils/formily-json-schema/componentDefs/DefaultArray";
import {DefaultObjectComponentDef} from "@/utils/formily-json-schema/componentDefs/DefaultObject";
import {TopObjectComponentDef} from "@/utils/formily-json-schema/componentDefs/TopObject";


export const SystemComponentDefs = [
    // High Level Component
    new TopObjectComponentDef(),

    // Basic Component
    new DefaultNumberComponentDef(),
    new DefaultSwitchComponentDef(),
    new DefaultInputComponentDef(),
    new DefaultArrayComponentDef(),
    new DefaultObjectComponentDef(),
]


