import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import DirectoryItem from '@/types/api-router/webui/DirectoryItem';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import Scene from '@/types/server/meta/Scene';
import request from '@/services/local/request';

const prefix = '/task-bundle';

const taskBundleLocalAPI = {
  webui: {
    async get(bundlePath: string): Promise<WebUITaskBundle> {
      return (
        await request.get(`${prefix}/webui`, {
          params: {
            bundlePath,
          },
        })
      ).data;
    },
    async save(
      bundlePath: string,
      taskId: string,
      serverUrl: string,
      scene: Scene,
      createSceneParams: CreateSceneParams
    ): Promise<DirectoryItem[]> {
      return (
        await request.post(`${prefix}/webui`, {
          bundlePath,
          taskId,
          serverUrl,
          scene,
          createSceneParams,
        })
      ).data;
    },
    async getAll(bundlesPath: string): Promise<Record<string, WebUITaskBundleTaskInfo[]>> {
      return (
        await request.get(`${prefix}/webui/all`, {
          params: {
            bundlesPath,
          },
        })
      ).data;
    },
  },
  server: {
    async get(bundlePath: string): Promise<ServerTaskBundle> {
      return (
        await request.get(`${prefix}`, {
          params: {
            bundlePath,
          },
        })
      ).data;
    },
  },
};

export default taskBundleLocalAPI;
