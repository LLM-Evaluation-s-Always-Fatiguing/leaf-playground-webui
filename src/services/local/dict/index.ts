import request from '@/services/local/request';

const prefix = '/dict';

const dictLocalAPI = {
  async open(dictPath: string): Promise<void> {
    await request.post(`${prefix}/open`, {
      dictPath,
    });
  },
};

export default dictLocalAPI;
