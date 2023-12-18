import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import Scene from '@/types/server/meta/Scene';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';

export default interface WebUITaskBundle {
  taskInfo: WebUITaskBundleTaskInfo;
  scene: Scene;
  createSceneParams: CreateSceneParams;
}
