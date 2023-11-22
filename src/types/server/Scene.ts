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

export default interface Scene {
  id: string;
  scene_metadata: SceneMetaData;
  agents_metadata: Record<string, SceneAgentMetaData>;
  role_agents_num: Record<string, number>;
  scene_info_config_schema: any;
  agents_config_schemas: Record<string, any>;
  additional_config_schema: any;
}
