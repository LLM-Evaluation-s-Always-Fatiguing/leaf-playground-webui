import request from '@/services/local/request';

const prefix = '/path';

const pathLocalAPI = {
  async join(...paths: string[]): Promise<string> {
    return (
      await request.post(`${prefix}/join`, {
        paths,
      })
    ).data.result;
  },
};

export default pathLocalAPI;
