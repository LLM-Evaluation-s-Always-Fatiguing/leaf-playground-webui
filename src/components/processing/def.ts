import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneActionLog } from '@/types/server/common/Log';
import Scene from '@/types/server/meta/Scene';

export interface DefaultProcessingVisualizationComponentProps {
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
  logs: SceneActionLog[];
  targetAgentId?: string;
  playerMode: boolean;
  needScrollToLog?: (logId: string) => void;
}
