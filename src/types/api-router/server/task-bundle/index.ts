import { ServerTaskBundleScene } from '@/types/api-router/server/task-bundle/Scene';
import SceneLog from '@/types/server/Log';
import ServerTaskBundleAgent from '@/types/api-router/server/task-bundle/Agent';
import ServerTaskBundleMetric from '@/types/api-router/server/task-bundle/Metric';
import ServerTaskBundleChart from '@/types/api-router/server/task-bundle/Chart';

export default interface ServerTaskBundle {
  scene: ServerTaskBundleScene;
  logs: SceneLog[];
  agents: Record<string, ServerTaskBundleAgent>;
  metrics: ServerTaskBundleMetric[];
  charts: ServerTaskBundleChart[];
}
