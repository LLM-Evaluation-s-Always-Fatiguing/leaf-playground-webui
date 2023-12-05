import request from '@/services/server/request';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import { SceneTaskStatus } from '@/types/server/Scene';
import { ServerTaskBundleAgentConfig } from "@/types/api-router/server/task-bundle/Agent";

const sceneTaskAPI = {
  async createSceneTask(config: RunSceneConfig): Promise<{
    task_id: string;
    save_dir: string;
    agent_configs: ServerTaskBundleAgentConfig[];
  }> {
    return (await request.post('/task/create', config)).data;
  },
  async getStatus(taskId: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (await request.get(`/task/status/${taskId}`)).data;
  },
};

export default sceneTaskAPI;
