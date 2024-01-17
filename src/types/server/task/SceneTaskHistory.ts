import { SceneTaskStatus } from '@/types/server/task/SceneTask';

export default interface SceneTaskHistory {
  id: string;
  project_id: string;
  status: SceneTaskStatus;
  created_at: string;
  results_dir?: string;
}
