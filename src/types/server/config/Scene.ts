import DynamicObject from "@/types/server/DynamicObject";
import SceneAgentConfig from "@/types/server/config/Agent";
import { ActionConfig } from "@/types/server/config/Action";

export interface SceneRoleConfig {
  actions_config: Record<string, ActionConfig>;
  agents_config?: SceneAgentConfig[];
}

export interface SceneConfigData {
  roles_config: Record<string, SceneRoleConfig>;
  [key: string]: any
}

export interface SceneObjConfig {
  scene_obj: DynamicObject;
  scene_config_data: SceneConfigData
}
