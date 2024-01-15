import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneActionLog } from '@/types/server/common/Log';
import Scene from '@/types/server/meta/Scene';
import Project from '@/types/server/meta/Project';

export interface DefaultProcessingVisualizationComponentProps {
  project: Project;
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
  logs: SceneActionLog[];
  targetAgentId?: string;
  playerMode: boolean;
  needScrollToLog?: (logId: string) => void;
}
