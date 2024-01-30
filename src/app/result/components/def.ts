import { Component, FunctionComponent } from 'react';
import SceneTaskResultDataMetrics from '@/types/server/task/result-data/Metric';
import { CreateSceneTaskParams } from '@/types/server/config/CreateSceneTaskParams';
import SceneLog from '@/types/server/common/Log';
import Scene from '@/types/server/meta/Scene';

export interface DefaultResultReportComponentProps {
  scene: Scene;
  createSceneTaskParams: CreateSceneTaskParams;
  metrics?: SceneTaskResultDataMetrics;
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
