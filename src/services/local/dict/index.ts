import request from '@/services/local/request';
import DirectoryItem from '@/types/api-router/DirectoryItem';

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
      directoryPath: dictPath,
    });
  },
};

export default dictLocalAPI;
