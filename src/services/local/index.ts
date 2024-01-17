import environmentVariablesLocalAPI from '@/services/local/environment-variables';
import networkLocalAPI from '@/services/local/network';
import sceneTaskLocalAPI from '@/services/local/task-bundle';

const LocalAPI = {
  environment: environmentVariablesLocalAPI,
  network: networkLocalAPI,
  sceneTask: sceneTaskLocalAPI,
};

export default LocalAPI;
