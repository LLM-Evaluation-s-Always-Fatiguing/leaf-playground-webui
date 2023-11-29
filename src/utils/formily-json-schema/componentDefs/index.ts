import { DefaultNumberComponentDef } from '@/utils/formily-json-schema/componentDefs/DefaultNumber';
import { DefaultSwitchComponentDef } from '@/utils/formily-json-schema/componentDefs/DefaultSwitch';
import { DefaultInputComponentDef } from '@/utils/formily-json-schema/componentDefs/DefaultInput';
import { DefaultArrayComponentDef } from '@/utils/formily-json-schema/componentDefs/DefaultArray';
import { DefaultObjectComponentDef } from '@/utils/formily-json-schema/componentDefs/DefaultObject';
import { TopObjectComponentDef } from '@/utils/formily-json-schema/componentDefs/TopObject';
import { NullableBasicAnyOfDef } from '@/utils/formily-json-schema/componentDefs/NullableBasicAnyOf';
import { RemoveTitleTempSuffixDef } from '@/utils/formily-json-schema/componentDefs/RemoveTitleTempSuffix';
import { NoConfigRequiredDef } from "@/utils/formily-json-schema/componentDefs/NoConfigRequired";

export const SystemComponentDefs = [
  // Preprocessor Component
  new RemoveTitleTempSuffixDef(),

  // High Level Component
  new NoConfigRequiredDef(),
  new TopObjectComponentDef(),
  new NullableBasicAnyOfDef(),

  // Basic Component
  new DefaultNumberComponentDef(),
  new DefaultSwitchComponentDef(),
  new DefaultInputComponentDef(),
  new DefaultArrayComponentDef(),
  new DefaultObjectComponentDef(),
];
