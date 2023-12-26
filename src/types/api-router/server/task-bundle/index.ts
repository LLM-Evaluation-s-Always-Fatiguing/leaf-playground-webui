import ServerTaskBundleCharts from '@/types/api-router/server/task-bundle/Chart';
import ServerTaskBundleMetrics from '@/types/api-router/server/task-bundle/Metric';
import SceneLog from '@/types/server/Log';
import { SceneObjConfig } from '@/types/server/config/Scene';

export default interface ServerTaskBundle {
  sceneObjConfig: SceneObjConfig;
  charts: ServerTaskBundleCharts;
  metrics: ServerTaskBundleMetrics;
  logs: SceneLog[];
}
