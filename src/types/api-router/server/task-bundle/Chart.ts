import { VisualizationSpec } from "vega-embed";

export default interface ServerTaskBundleChart {
  name: string;
  fullPath: string;
  vegaSpec: VisualizationSpec;
}
