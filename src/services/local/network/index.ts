import request from '@/services/local/request';

const prefix = '/network';

const networkLocalAPI = {
  async getLocalIP(): Promise<any> {
    return (await request.get(`${prefix}/ip`)).data;
  },
};

export default networkLocalAPI;
