import SceneTaskResultBundleCharts from '@/types/server/task/result-bundle/Chart';
import SceneTaskResultBundleMetrics from '@/types/server/task/result-bundle/Metric';
import SceneLog from '@/types/server/common/Log';
import { SceneObjConfig } from '@/types/server/config/Scene';

export default interface SceneTaskResultBundle {
  sceneObjConfig: SceneObjConfig;
  charts: SceneTaskResultBundleCharts;
  metrics: SceneTaskResultBundleMetrics;
  logs: SceneLog[];
}
