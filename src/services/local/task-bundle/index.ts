import request from '@/services/local/request';
import SceneTaskResultBundle from '../../../types/server/task/result-bundle';

const prefix = '/task-bundle';

const sceneTaskLocalAPI = {
  async getResultBundle(bundlePath: string): Promise<SceneTaskResultBundle> {
    return (
      await request.get(`${prefix}`, {
        params: {
          bundlePath,
        },
      })
    ).data;
  },
};

export default sceneTaskLocalAPI;
