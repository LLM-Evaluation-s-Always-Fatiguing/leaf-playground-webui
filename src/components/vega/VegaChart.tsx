'use client';

import React, { useEffect, useRef } from 'react';
import embed, { VisualizationSpec } from 'vega-embed';
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
  vSpec: VisualizationSpec;
}

const VegaChart: React.FunctionComponent<VegaChartProps> = (props) => {
  const theme = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartDomRef = useRef<HTMLDivElement>(null);
  const chartViewRef = useRef<View>();

  const embedChart = () => {
    if (chartDomRef.current) {
      embed(chartDomRef.current, props.vSpec, {
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
  }, [props.vSpec, theme.appearance]);

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
