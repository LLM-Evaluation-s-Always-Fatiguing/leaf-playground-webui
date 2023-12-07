import request from '@/services/local/request';
import DirectoryItem from '@/types/api-router/webui/DirectoryItem';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import WebUITaskBundleTaskInfo from '@/types/api-router/webui/task-bundle/TaskInfo';
import { ServerTaskBundleAgentConfig } from '@/types/api-router/server/task-bundle/Agent';
import WebUITaskBundle from '@/types/api-router/webui/task-bundle';
import ServerTaskBundle from '@/types/api-router/server/task-bundle';
import LocalAPI from '@/services/local';

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
      scene: Scene,
      runConfig: RunSceneConfig,
      agentConfigs: ServerTaskBundleAgentConfig[]
    ): Promise<DirectoryItem[]> {
      return (
        await request.post(`${prefix}/webui`, {
          bundlePath,
          taskId,
          scene,
          runConfig,
          agentConfigs,
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
      const originResp = (
        await request.get(`${prefix}`, {
          params: {
            bundlePath,
          },
        })
      ).data as Omit<ServerTaskBundle, 'chartOptions'> & { chartOptionObjectStrings: string[] };
      const chartOptions = [];
      for (const chartOptionString of originResp.chartOptionObjectStrings) {
        const cmd = `(() => (${chartOptionString}))()`;
        chartOptions.push(eval(cmd));
      }
      return {
        ...originResp,
        chartOptions,
      };
    },
  },
};

export default taskBundleLocalAPI;