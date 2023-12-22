export default interface WebUITaskBundleTaskInfo {
  id: string;
  sceneMd5: string;
  bundlePath: string;
  roleAgentsMap: Record<string, string[]>;
  enableMetricsName: string[];
  enableEvaluatorsName: string[];
  serverUrl: string;
  time: string;
  finished: boolean;
}
