import WebUIAppEnvironmentVariables from '@/types/webui/AppEnvironmentVariables';
import request from '@/services/local/request';

const prefix = '/environment-variables';

const environmentVariablesLocalAPI = {
  async get(): Promise<WebUIAppEnvironmentVariables> {
    return (await request.get(`${prefix}`)).data;
  },
};

export default environmentVariablesLocalAPI;
