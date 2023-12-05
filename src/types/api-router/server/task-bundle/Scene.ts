export interface ServerTaskBundleScene {
  config: {
    scene_info: Record<string, any>;
    scene_agents: Record<string, any>;

    [key: string]: any;
  };

  [key: string]: any;
}
