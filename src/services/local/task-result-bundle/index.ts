import request from '@/services/local/request';
import DirectoryItem from '@/types/api-router/DirectoryItem';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';
import TaskInfo from '@/types/api-router/TaskInfo';

const prefix = '/task-result-bundle';

const taskResultBundleLocalAPI = {
  async getInfo(bundlePath: string): Promise<{
    task: TaskInfo;
    scene: Scene;
    runConfig: RunSceneConfig;
  }> {
    return (
      await request.get(`${prefix}/info`, {
        params: {
          bundlePath,
        },
      })
    ).data;
  },
  async saveInfo(
    bundlePath: string,
    taskId: string,
    scene: Scene,
    runConfig: RunSceneConfig
  ): Promise<DirectoryItem[]> {
    return (
      await request.post(`${prefix}/info`, {
        bundlePath,
        taskId,
        scene,
        runConfig,
      })
    ).data;
  },
  async getAll(bundlesPath: string): Promise<Record<string, TaskInfo[]>> {
    return (
      await request.get(`${prefix}/all`, {
        params: {
          bundlesPath,
        },
      })
    ).data;
  },
};

export default taskResultBundleLocalAPI;
