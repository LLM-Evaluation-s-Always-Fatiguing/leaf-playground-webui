import FormilyJSONSchema from '@/types/FormilyJSONSchema';
import SampleJSONSchema from '@/types/SampleJSONSchema';
import DynamicObject from '@/types/server/DynamicObject';
import SceneAgentMetadata, { ServerSceneAgentMetadata } from '@/types/server/meta/Agent';
import EvaluatorMetadata, { ServerEvaluatorMetadata } from '@/types/server/meta/Evaluator';

export interface SceneEnvVarDefinition {
  name: string;
  description: string;
  current_value: any;
}

export interface SceneActionSignatureParameterDefinition {
  name: string;
  annotation?: any;
}

export interface SceneActionSignatureDefinition {
  name: string;
  description: string;
  annotation?: any;
  signature: SceneActionSignatureParameterDefinition;
}

export enum SceneMetricRecordValueDType {
  SCALAR = 'scalar',
  VECTOR = 'vector',
  NESTED_SCALAR = 'nested_scalar',
  NESTED_VECTOR = 'nested_vector',
}

export enum SceneMetricRecordDisplayType {
  FiveStarsRate = 'FiveStarsRate',
  NumberInput = 'NumberInput',
  BooleanRadio = 'BooleanRadio',
}

export interface SceneMetricDefinition {
  name: string;
  description: string;
  record_value_dtype: SceneMetricRecordValueDType;
  record_display_type?: SceneMetricRecordDisplayType;
  expect_resp_msg_type: string;
  is_comparison: boolean;
}

export interface SceneActionDefinition {
  name: string;
  description: string;
  signature: SceneActionSignatureDefinition;
  metrics?: SceneMetricDefinition[];
}

export interface SceneRoleDefinition {
  name: string;
  description: string;
  actions: SceneActionDefinition[];
  num_agents_range: [number, number];
  is_static: boolean;
}

export interface SceneDefinition {
  name: string;
  description: string;
  env_vars: SceneEnvVarDefinition[];
  roles: SceneRoleDefinition[];
}

export interface ServerSceneMetadata {
  scene_definition: SceneDefinition;
  config_schema: SampleJSONSchema;
  obj_for_import: DynamicObject;
}

export interface SceneMetadata extends ServerSceneMetadata {
  configSchema: FormilyJSONSchema;
}

export interface SceneChartMetadata {
  cls_name: string;
  obj_for_import: DynamicObject;
  chart_name: string;
  supported_metric_names: string[];
}

export interface ServerScene {
  scene_metadata: ServerSceneMetadata;
  agents_metadata: Record<string, ServerSceneAgentMetadata[]>;
  evaluators_metadata: ServerEvaluatorMetadata[];
  charts_metadata?: SceneChartMetadata[];
  work_dir: string;
}

export default interface Scene extends ServerScene {
  scene_metadata: SceneMetadata;
  agents_metadata: Record<string, SceneAgentMetadata[]>;
  evaluators_metadata: EvaluatorMetadata[];
  readme?: string;
}
