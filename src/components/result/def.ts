import { Component, FunctionComponent } from 'react';
import ServerTaskBundleMetrics from '@/types/api-router/server/task-bundle/Metric';
import { CreateSceneParams } from '@/types/server/CreateSceneParams';
import SceneLog from '@/types/server/Log';
import Scene from '@/types/server/meta/Scene';

export interface DefaultResultReportComponentProps {
  scene: Scene;
  createSceneParams: CreateSceneParams;
  logs: SceneLog[];
  metrics?: ServerTaskBundleMetrics;
}

export interface DefaultResultReportComponentStatics {
  reportName: string;
  requiredMetrics: string[];
}

export interface ResultReportFunctionComponent<P extends DefaultResultReportComponentProps>
  extends FunctionComponent<P>,
    DefaultResultReportComponentStatics {}

export interface ResultReportClassComponent<P extends DefaultResultReportComponentProps, S = {}>
  extends Component<P, S>,
    DefaultResultReportComponentStatics {}
