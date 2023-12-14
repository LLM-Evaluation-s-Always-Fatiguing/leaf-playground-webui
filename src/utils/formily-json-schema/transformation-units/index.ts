import BasicAllOfTransformationUnit from './basic/all-of';
import BasicArrayTransformationUnit from './basic/array';
import BasicObjectTransformationUnit from './basic/object';
import BasicBooleanTransformationUnit from './basic/boolean';
import BasicNumberTransformationUnit from './basic/number';
import BasicStringTransformationUnit from './basic/string';
import RemoveTitleTempSuffixPreprocessor from './preprocessor/remove-title-temp-suffix';
import TopObjectTransformationUnit from './specialized/top-object';
import EmptyObjectNoConfigRequiredTransformationUnit from './specialized/empty-object-no-config-required';
import NoObjectNullableAnyOfTransformationUnit from "./specialized/no-object-nullable-any-of";
import ObjectNullableAnyOfTransformationUnit
  from "@/utils/formily-json-schema/transformation-units/specialized/object-nullable-any-of";

export const SystemTransformationUnits = [
  // Preprocessor
  new RemoveTitleTempSuffixPreprocessor(),

  // Specialized
  new TopObjectTransformationUnit(),
  new EmptyObjectNoConfigRequiredTransformationUnit(),
  new NoObjectNullableAnyOfTransformationUnit(),
  new ObjectNullableAnyOfTransformationUnit(),

  // Basic
  new BasicAllOfTransformationUnit(),
  new BasicArrayTransformationUnit(),
  new BasicObjectTransformationUnit(),
  new BasicBooleanTransformationUnit(),
  new BasicNumberTransformationUnit(),
  new BasicStringTransformationUnit(),
];
