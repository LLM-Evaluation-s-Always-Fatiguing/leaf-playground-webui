import request from '@/services/server/request';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import { SceneTaskStatus } from '@/types/server/SceneTask';

const sceneTaskAPI = {
  async createSceneTask(config: CreateSceneParams): Promise<{
    task_id: string;
    save_dir: string;
    scene_config: any;
    evaluator_configs: any;
  }> {
    return (await request.post('/task/create', config)).data;
  },
  async getStatus(taskId: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (await request.get(`/task/status/${taskId}`)).data;
  },
  async save(taskId: string) {
    return (await request.post(`/task/save/${taskId}`)).data;
  }
};

export default sceneTaskAPI;
