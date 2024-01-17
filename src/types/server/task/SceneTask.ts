export enum SceneTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  FINISHED = 'finished',
  INTERRUPTED = 'interrupted',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export const SceneTaskStatusDisplayStrMap = {
  [SceneTaskStatus.PENDING]: 'Pending',
  [SceneTaskStatus.RUNNING]: 'Running',
  [SceneTaskStatus.FINISHED]: 'Finished',
  [SceneTaskStatus.INTERRUPTED]: 'Interrupted',
  [SceneTaskStatus.PAUSED]: 'Paused',
  [SceneTaskStatus.FAILED]: 'Failed',
};
