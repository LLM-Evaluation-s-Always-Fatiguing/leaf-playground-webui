import DirectoryItem from '@/types/api-router/webui/DirectoryItem';
import request from '@/services/local/request';

const prefix = '/dict';

const dictLocalAPI = {
  async read(dictPath: string): Promise<DirectoryItem[]> {
    return (
      await request.get(`${prefix}`, {
        params: {
          dictPath,
        },
      })
    ).data;
  },
  async open(dictPath: string): Promise<void> {
    await request.post(`${prefix}/open`, {
      dictPath,
    });
  },
};

export default dictLocalAPI;
