import SceneTaskResultDataCharts from '@/types/server/task/result-data/Chart';
import SceneTaskResultDataMetrics from '@/types/server/task/result-data/Metric';

export default interface SceneTaskResultDataWithoutLogs {
  charts: SceneTaskResultDataCharts;
  metrics: SceneTaskResultDataMetrics;
}
