import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import Scene from '@/types/server/meta/Scene';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import { ServerTaskBundleAgentConfig } from '@/types/api-router/server/task-bundle/Agent';

export default interface WebUITaskBundle {
  taskInfo: WebUITaskBundleTaskInfo;
  scene: Scene;
  runConfig: CreateSceneParams;
  agentConfigs: ServerTaskBundleAgentConfig[];
}
