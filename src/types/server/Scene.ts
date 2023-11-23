import { ISchema as FormilyJSONSchema } from '@formily/json-schema';
import SampleJSONSchemaDef from '@/types/SampleJSONSchemaDef';

export interface SceneRoleDefinitionType {
  obj: string;
  module: string;
  source_file?: string;
}

export interface SceneRoleDefinitionAgentType {
  obj: string;
  module: string;
  source_file?: string;
}

export interface SceneRoleDefinition {
  name: string;
  description: string;
  num_agents: number;
  is_static: boolean;
  type: SceneRoleDefinitionType;
  agent_type: SceneRoleDefinitionAgentType;
}

export interface SceneMetaData {
  name: string;
  description: string;
  role_definitions: SceneRoleDefinition[];
}

export interface SceneAgentMetaData {
  description: string;
  actions: Record<string, string>;
}

export interface ServerScene {
  id: string;
  scene_metadata: SceneMetaData;
  agents_metadata: Record<string, SceneAgentMetaData>;
  role_agents_num: Record<string, number>;
  scene_info_config_schema: SampleJSONSchemaDef;
  agents_config_schemas: Record<string, SampleJSONSchemaDef>;
  additional_config_schema: SampleJSONSchemaDef;
}

export default interface Scene extends ServerScene {
  sceneInfoConfigFormilySchema: FormilyJSONSchema;
  agentsConfigFormilySchemas: Record<string, FormilyJSONSchema>;
  additionalConfigFormilySchema: FormilyJSONSchema;
}

export interface SceneListItem {
  id: string;
  metadata: SceneMetaData;
}
