import { EChartsOption } from "echarts";

export default interface ServerTaskBundleChart {
  name: string;
  fullPath: string;
  eChartOption: EChartsOption;
}
