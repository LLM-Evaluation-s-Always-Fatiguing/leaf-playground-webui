import sceneAPI from '@/services/server/scene';
import sceneTaskAPI from '@/services/server/task';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import request from '@/services/server/request';
import ServerInfo from '@/types/server/ServerInfo';

const ServerAPI = {
  scene: sceneAPI,
  sceneTask: sceneTaskAPI,
  async info(): Promise<ServerInfo> {
    return (await request.get('/info')).data;
  },
};

export default ServerAPI;
