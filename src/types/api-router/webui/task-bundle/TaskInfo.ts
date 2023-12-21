export default interface WebUITaskBundleTaskInfo {
  id: string;
  sceneMd5: string;
  bundlePath: string;
  agentsName: string[];
  serverUrl: string;
  time: string;
  finished: boolean;
}
