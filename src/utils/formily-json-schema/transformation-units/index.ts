import ObjectNullableAnyOfTransformationUnit from '@/utils/formily-json-schema/transformation-units/specialized/object-nullable-any-of';
import BasicAllOfTransformationUnit from './basic/all-of';
import BasicArrayTransformationUnit from './basic/array';
import BasicBooleanTransformationUnit from './basic/boolean';
import BasicNumberTransformationUnit from './basic/number';
import BasicObjectTransformationUnit from './basic/object';
import BasicStringTransformationUnit from './basic/string';
import RemoveTitleTempSuffixPreprocessor from './preprocessor/remove-title-temp-suffix';
import EmptyObjectNoConfigRequiredTransformationUnit from './specialized/empty-object-no-config-required';
import NoObjectNullableAnyOfTransformationUnit from './specialized/no-object-nullable-any-of';
import TopObjectTransformationUnit from './specialized/top-object';

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
