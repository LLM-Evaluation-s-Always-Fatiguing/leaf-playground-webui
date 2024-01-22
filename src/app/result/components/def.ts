import { Component, FunctionComponent } from 'react';
import SceneTaskResultBundleMetrics from '@/types/server/task/result-bundle/Metric';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import SceneLog from '@/types/server/common/Log';
import Scene from '@/types/server/meta/Scene';

export interface DefaultResultReportComponentProps {
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
  logs: SceneLog[];
  metrics?: SceneTaskResultBundleMetrics;
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
