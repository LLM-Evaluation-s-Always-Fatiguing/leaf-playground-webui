import { SceneTaskStatus } from '@/types/server/SceneTask';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import { default as localRequest } from '@/services/local/request';
import request from '@/services/server/request';

const sceneTaskAPI = {
  async createSceneTask(config: CreateSceneTaskParams): Promise<{
    id: string;
    host: string;
    port: string;
    created_at: string;
  }> {
    return (await request.post('/task/create', config)).data;
  },
  async getStatus(taskId: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (await request.get(`/task/${taskId}/status`)).data;
  },
  async getSceneTaskPayload(taskId: string): Promise<CreateSceneTaskParams> {
    return (await request.get(`/task/${taskId}/payload`)).data;
  },

  async status(serverUrl: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (
      await localRequest.get(`/server/task/status`, {
        params: {
          serverUrl,
        },
      })
    ).data;
  },
  async pause(serverUrl: string) {
    return (
      await localRequest.post(`/server/task/pause`, {
        serverUrl,
      })
    ).data;
  },
  async resume(serverUrl: string) {
    return (
      await localRequest.post(`/server/task/resume`, {
        serverUrl,
      })
    ).data;
  },
  async interrupt(serverUrl: string) {
    return (
      await localRequest.post(`/server/task/interrupt`, {
        serverUrl,
      })
    ).data;
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
  async getAgentConnectedStatus(serverUrl: string): Promise<Record<string, boolean>> {
    return (
      await localRequest.get(`/server/task/agents_connected`, {
        params: {
          serverUrl,
        },
      })
    ).data;
  },
};

export default sceneTaskAPI;
