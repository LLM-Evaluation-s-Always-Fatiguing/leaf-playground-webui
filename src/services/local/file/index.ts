import request from '@/services/local/request';

const prefix = '/file';

const fileLocalAPI = {
  async readJSON(filePath: string): Promise<any> {
    return (
      await request.get(`${prefix}`, {
        params: {
          filePath,
        },
      })
    ).data;
  },
  async readJSONL(filePath: string): Promise<any[]> {
    const jsonLStr: string = (
      await request.get(`${prefix}`, {
        params: {
          filePath,
        },
        responseType: 'text',
      })
    ).data;
    return jsonLStr
      .replace(/\n*$/, '')
      .split(/\n/)
      .filter((line) => line.trim())
      .map((json) => {
        return JSON.parse(json);
      });
  },
};

export default fileLocalAPI;
