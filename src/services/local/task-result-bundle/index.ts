import request from '@/services/local/request';
import DirectoryItem from '@/types/api-router/DirectoryItem';
import Scene from '@/types/server/Scene';
import RunSceneConfig from '@/types/server/RunSceneConfig';

const prefix = '/task-result-bundle';

const taskResultBundleLocalAPI = {
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
};

export default taskResultBundleLocalAPI;
