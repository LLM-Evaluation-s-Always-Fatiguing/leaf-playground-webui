import { SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import request from '@/services/server/request';
import { prefix as taskPrefix } from './index';

const prefix = (taskId: string) => {
  return `${taskPrefix}/${taskId}/logs`;
};

const sceneTaskLogsAPI = {
  async updateLogHumanMetricRecord(
    taskId: string,
    logId: string,
    agentId: string,
    data: {
      metric_name: string;
      value: any;
      reason?: string;
    }
  ) {
    return (
      await request.post(`${prefix(taskId)}/${logId}/record/metric/update`, data, {
        params: {
          agent_id: agentId,
        },
      })
    ).data;
  },
  async updateLogHumanCompareMetricRecord(
    taskId: string,
    logId: string,
    data: {
      metric_name: string;
      value: string[];
      reason?: string;
    }
  ) {
    return (await request.post(`${prefix(taskId)}/${logId}/record/compare/update`, data)).data;
  },
};

export default sceneTaskLogsAPI;
