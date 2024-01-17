import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import SceneAgentConfig from '@/types/server/config/Agent';
import SceneAgentMetadata from '@/types/server/meta/Agent';
import Scene, { SceneRoleDefinition } from '@/types/server/meta/Scene';

export default interface WebUIAgentInstance {
  config: SceneAgentConfig;
  meta: SceneAgentMetadata;
  role: SceneRoleDefinition;
}

export function getAllAgentInstanceFrom(scene: Scene, createSceneTaskParams: CreateSceneTaskParams): WebUIAgentInstance[] {
  const allAgentInstances: WebUIAgentInstance[] = [];
  Object.entries(createSceneTaskParams.scene_obj_config.scene_config_data.roles_config).forEach(
    ([roleName, roleConfig]) => {
      const role = scene.scene_metadata.scene_definition.roles.find((r) => r.name === roleName);
      if (role) {
        (roleConfig.agents_config || []).forEach((agentConfig) => {
          const agentMeta = (scene.agents_metadata[roleName] || []).find(
            (a) => a.obj_for_import.obj === agentConfig.obj_for_import.obj
          );
          if (agentMeta) {
            allAgentInstances.push({
              config: agentConfig,
              meta: agentMeta,
              role,
            });
          }
        });
      }
    }
  );
  return allAgentInstances;
}
