import React, { useEffect, useRef } from 'react';
import ServerTaskBundleChart from '@/types/api-router/server/task-bundle/Chart';
import embed from 'vega-embed';
import { View } from 'vega';
import styled from '@emotion/styled';
import { useTheme } from 'antd-style';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .vega-chart {
    width: 100%;
    height: 100%;
  }
`;

interface VegaChartProps {
  chart: ServerTaskBundleChart;
}

const VegaChart: React.FunctionComponent<VegaChartProps> = (props) => {
  const theme = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartDomRef = useRef<HTMLDivElement>(null);
  const chartViewRef = useRef<View>();

  const embedChart = () => {
    if (chartDomRef.current) {
      embed(chartDomRef.current, props.chart.vegaSpec, {
        theme: theme.appearance === 'dark' ? 'dark' : undefined,
        config: {
          autosize: {
            type: 'pad',
          },
        },
      })
        .then((result) => {
          if (chartViewRef.current) {
            chartViewRef.current.finalize();
          }
          chartViewRef.current = result.view;
        })
        .catch((error) => console.error(error));
    }
  };

  useEffect(() => {
    embedChart();
  }, [props.chart.vegaSpec, theme.appearance]);

  useEffect(() => {
    return () => {
      if (chartViewRef.current) {
        chartViewRef.current.finalize();
        chartViewRef.current = undefined;
      }
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <div className="vega-chart" ref={chartDomRef} />
    </Container>
  );
};

export default VegaChart;
