import request from '@/services/local/request';
import DirectoryItem from '@/types/api-router/DirectoryItem';

const prefix = '/file';

const fileLocalAPI = {
  async listDict(dictPath: string): Promise<DirectoryItem[]> {
    return (
      await request.get(`${prefix}/list-dict`, {
        params: {
          dictPath,
        },
      })
    ).data;
  },
  async readJSONL(filePath: string): Promise<any[]> {
    const jsonLStr: string = (
      await request.get(`${prefix}/read`, {
        params: {
          filePath,
        },
      })
    ).data;
    return jsonLStr
      .replace(/\n*$/, '')
      .split(/\n/)
      .map((json) => {
        return JSON.parse(json);
      });
  },
  async openDict(dictPath: string): Promise<void> {
    await request.post(`${prefix}/open-dict`, {
      directoryPath: dictPath,
    });
  },
};

export default fileLocalAPI;
