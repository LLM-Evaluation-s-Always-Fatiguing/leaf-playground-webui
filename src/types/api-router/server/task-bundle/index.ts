import SceneLog from '@/types/server/Log';
import { SceneObjConfig } from "@/types/server/config/Scene";

export default interface ServerTaskBundle {
  sceneObjConfig: SceneObjConfig;
  logs: SceneLog[];
}
