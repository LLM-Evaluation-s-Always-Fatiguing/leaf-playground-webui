import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import Scene from '@/types/server/meta/Scene';

export default interface WebUITaskBundle {
  taskInfo: WebUITaskBundleTaskInfo;
  scene: Scene;
  createSceneParams: CreateSceneParams;
}
