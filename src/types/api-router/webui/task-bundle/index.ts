import WebUITaskBundleTaskInfo from "@/types/api-router/webui/task-bundle/TaskInfo";
import Scene from "@/types/server/Scene";
import RunSceneConfig from "@/types/server/RunSceneConfig";
import { ServerTaskBundleAgentConfig } from "@/types/api-router/server/task-bundle/Agent";

export default interface WebUITaskBundle {
  taskInfo: WebUITaskBundleTaskInfo;
  scene: Scene;
  runConfig: RunSceneConfig;
  agentConfigs: ServerTaskBundleAgentConfig[];
}
