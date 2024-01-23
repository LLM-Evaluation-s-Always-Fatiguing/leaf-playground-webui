import Scene, { ServerScene } from '@/types/server/meta/Scene';

export interface ServerProject {
  name: string;
  id: string;
  version: string;
  leaf_version: string;
  created_at: string;
  last_update: string;
  metadata: ServerScene;
  work_dir: string;
  readme: string;
  requirements: string;
  dockerfile: string;
}

export default interface Project extends ServerProject {
  metadata: Scene;
}

export interface ListProject extends Pick<Project, 'id' | 'name'> {
  display_name?: string;
  description: string;
}
