import projectAPI from '@/services/server/project';
import siteAPI from '@/services/server/site';
import sceneTaskAPI from '@/services/server/task';

const ServerAPI = {
  site: siteAPI,
  project: projectAPI,
  sceneTask: sceneTaskAPI,
};

export default ServerAPI;
