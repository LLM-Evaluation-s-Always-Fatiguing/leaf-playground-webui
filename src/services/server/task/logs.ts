import { SceneMetricRecordDisplayType } from '@/types/server/meta/Scene';
import request from '@/services/server/request';
import { prefix as taskPrefix } from './index';

const prefix = (taskId: string) => {
  return `${taskPrefix}/${taskId}/logs`;
};

const sceneTaskLogsAPI = {
  async updateLogHumanMetricRecord(
    taskId: string,
    params: {
      log_id: string;
      metric_name: string;
      value: any;
      display_type: SceneMetricRecordDisplayType;
      target_agent: string;
      reason?: string;
    }
  ) {
    return (await request.post(`${prefix(taskId)}/${params.log_id}/record/metric/update`, params)).data;
  },
  async updateLogHumanCompareMetricRecord(
    taskId: string,
    params: {
      log_id: string;
      metric_name: string;
      value: string[];
      reason?: string;
    }
  ) {
    return (await request.post(`${prefix(taskId)}/${params.log_id}/record/compare/update`, params)).data;
  },
};

export default sceneTaskLogsAPI;
