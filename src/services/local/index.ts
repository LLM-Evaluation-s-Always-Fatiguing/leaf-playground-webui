import environmentVariablesLocalAPI from '@/services/local/environment-variables';
import networkLocalAPI from '@/services/local/network';

const LocalAPI = {
  environment: environmentVariablesLocalAPI,
  network: networkLocalAPI,
};

export default LocalAPI;
