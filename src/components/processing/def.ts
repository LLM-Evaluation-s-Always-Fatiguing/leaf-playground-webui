import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import { SceneActionLog } from '@/types/server/Log';
import Scene from '@/types/server/meta/Scene';

export interface DefaultProcessingVisualizationComponentProps {
  scene: Scene;
  createSceneParams: CreateSceneParams;
  logs: SceneActionLog[];
}
