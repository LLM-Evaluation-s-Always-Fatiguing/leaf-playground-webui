import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import { SceneTaskStatus } from '@/types/server/task/SceneTask';
import SceneTaskHistory from '@/types/server/task/SceneTaskHistory';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import request from '@/services/server/request';
import sceneTaskLogsAPI from '@/services/server/task/logs';

export const prefix = '/task';

const sceneTaskAPI = {
  async create(config: CreateSceneTaskParams): Promise<{
    id: string;
  }> {
    return (await request.post(`${prefix}/create`, config)).data;
  },
  async pause(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/pause`)).data;
  },
  async resume(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/resume`)).data;
  },
  async interrupt(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/interrupt`)).data;
  },
  async close(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/close`)).data;
  },
  async delete(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/delete`)).data;
  },
  async checkTaskServer(taskId: string): Promise<boolean> {
    try {
      await request.get(`${prefix}/${taskId}/hello`);
      return true;
    } catch {
      return false;
    }
  },
  async regenTaskResultBundle(taskId: string) {
    return (await request.post(`${prefix}/${taskId}/save`)).data;
  },
  async agentsConnectedStatus(taskId: string): Promise<Record<string, boolean>> {
    return (await request.get(`${prefix}/${taskId}/agents_connected`)).data;
  },
  async payload(taskId: string): Promise<CreateSceneTaskParams> {
    return (await request.get(`${prefix}/${taskId}/payload`)).data;
  },
  async status(taskId: string): Promise<{
    status: SceneTaskStatus;
  }> {
    return (await request.get(`${prefix}/${taskId}/status`)).data;
  },
  async resultBundlePath(taskId: string): Promise<string> {
    return (await request.get(`${prefix}/${taskId}/results_dir`)).data.results_dir;
  },

  async allHistoryMap(): Promise<Record<string, SceneTaskHistory[]>> {
    const allTaskHistories = (await request.get<SceneTaskHistory[]>(`${prefix}/history`)).data.sort((a, b) => {
      return dayjs(b.created_at).unix() - dayjs(a.created_at).unix();
    });
    return groupBy(allTaskHistories, (h) => h.project_id);
  },

  logs: sceneTaskLogsAPI,
};

export default sceneTaskAPI;
