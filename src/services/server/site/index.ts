import ServerAppInfo from '@/types/server/meta/ServerAppInfo';
import request from '@/services/server/request';
import { ListProject } from '@/types/server/meta/Project';

const siteAPI = {
  async homepage(): Promise<{
    projects: ListProject[];
    app_info: ServerAppInfo;
  }> {
    return (await request.get(`/`)).data;
  },
};

export default siteAPI;
