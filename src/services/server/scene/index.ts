import request from '@/services/server/request';
import { SceneListItem } from '@/types/server/Scene';

const sceneAPI = {
  async getScenes(): Promise<{
    scenes: SceneListItem[];
  }> {
    return (await request.get('/')).data;
  },
};

export default sceneAPI;
