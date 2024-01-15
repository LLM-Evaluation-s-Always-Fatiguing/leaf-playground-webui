import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import Scene from '@/types/server/meta/Scene';

export default interface WebUITaskBundle {
  taskInfo: WebUITaskBundleTaskInfo;
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
}
