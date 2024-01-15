import ServerAppInfo from '@/types/server/meta/ServerAppInfo';
import request from '@/services/server/request';

const siteAPI = {
  async homepage(): Promise<{
    projects: string[];
    app_info: ServerAppInfo;
  }> {
    return (await request.get(`/`)).data;
  },
};

export default siteAPI;
