import { SceneActionLog, SceneLogType } from '@/types/server/common/Log';
import { PaginationData, PaginationParams } from '@/services/server/def';
import request from '@/services/server/request';
import { prefix as taskPrefix } from './index';

const prefix = (taskId: string) => {
  return `${taskPrefix}/${taskId}/logs`;
};

const sceneTaskLogsAPI = {
  async searchActionLogs(taskId: string, paginationParams: PaginationParams): Promise<PaginationData<SceneActionLog>> {
    const logs = (
      await request.get(`${prefix(taskId)}`, {
        params: {
          skip: paginationParams.pageSize * (paginationParams.pageNo - 1),
          limit: paginationParams.pageSize,
          log_type: SceneLogType.ACTION,
        },
      })
    ).data;
    const totalItems = (
      await request.get(`${prefix(taskId)}/count`, {
        params: {
          log_type: SceneLogType.ACTION,
        },
      })
    ).data.count;
    return {
      items: logs,
      current: paginationParams.pageNo,
      totalElements: totalItems,
      totalPages: Math.ceil(totalItems / paginationParams.pageSize),
    };
  },
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
