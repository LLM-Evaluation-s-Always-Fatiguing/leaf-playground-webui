import request from '@/services/server/request';
import { default as localRequest } from '@/services/local/request';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import { SceneTaskStatus } from '@/types/server/SceneTask';
import { SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';

const sceneTaskAPI = {
  async createSceneTask(config: CreateSceneParams): Promise<{
    id: string;
    host: string;
    port: string;
    status: string;
    payload_path: any;
  }> {
    return (await request.post('/task/create', config)).data;
  },
  async getStatus(taskId: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (await request.get(`/task/status/${taskId}`)).data;
  },
  async save(serverUrl: string) {
    return (
      await localRequest.post(`/server/task/save`, {
        serverUrl,
      })
    ).data;
  },
  async updateLogHumanMetricRecord(
    serverUrl: string,
    params: {
      log_id: string;
      metric_name: string;
      value: any;
      display_type: SceneMetricRecordDisplayType;
      target_agent: string;
      reason?: string;
    }
  ) {
    return (
      await localRequest.post(`/server/task/metric-record/human`, {
        serverUrl,
        params,
      })
    ).data;
  },
  async updateLogHumanCompareMetricRecord(
    serverUrl: string,
    params: {
      log_id: string;
      metric_name: string;
      value: string[];
      reason?: string;
    }
  ) {
    return (
      await localRequest.post(`/server/task/metric-record/human-compare`, {
        serverUrl,
        params,
      })
    ).data;
  },
};

export default sceneTaskAPI;
