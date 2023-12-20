import DynamicObject from '@/types/server/DynamicObject';
import { SceneRoleConfig } from '@/types/server/config/Role';

export interface SceneConfigData {
  roles_config: Record<string, SceneRoleConfig>;

  [key: string]: any;
}

export interface SceneObjConfig {
  scene_obj: DynamicObject;
  scene_config_data: SceneConfigData;
}
