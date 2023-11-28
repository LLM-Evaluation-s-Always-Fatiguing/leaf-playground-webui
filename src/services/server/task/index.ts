import request from '@/services/server/request';
import RunSceneConfig from '@/types/server/RunSceneConfig';

const sceneTaskAPI = {
  async createSceneTask(config: RunSceneConfig): Promise<{
    task_id: string;
  }> {
    return (await request.post('/task/create', config)).data;
  },
};

export default sceneTaskAPI;
