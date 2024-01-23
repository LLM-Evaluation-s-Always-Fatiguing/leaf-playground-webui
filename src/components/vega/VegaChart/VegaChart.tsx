'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import { View } from 'vega';
import embed, { VisualizationSpec } from 'vega-embed';
import NormalNoBoxShadowCard from '@/components/basic/NormalNoBoxShadowCard';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .vega-chart {
    width: 100%;
    height: 100%;
  }

  .vega-actions {
    ::before {
      border-bottom-color: ${(props) => props.theme.colorBgBase} !important;
    }

    ::after {
      border-bottom-color: ${(props) => props.theme.colorBgBase} !important;
    }

    background: ${(props) => props.theme.colorBgBase} !important;
    border-color: ${(props) => props.theme.colorBgBase} !important;

    a {
      color: ${(props) => props.theme.colorText} !important;

      :hover {
        background: ${(props) => props.theme.colorBgTextHover} !important;
      }
    }
  }
`;

interface VegaChartComponentProps {
  vSpec: VisualizationSpec;
}

const VegaChartComponent: React.FunctionComponent<VegaChartComponentProps> = (props) => {
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
    <NormalNoBoxShadowCard
      bodyStyle={{
        width: '100%',
        height: '100%',
        padding: '12px 16px',
        borderRadius: theme.borderRadius,
        background: theme.isDarkMode ? 'rgb(51,51,51)' : theme.colorBgBase,
      }}
      bordered={false}
      hoverable
    >
      <Container ref={containerRef}>
        <div className="vega-chart" ref={chartDomRef} />
      </Container>
    </NormalNoBoxShadowCard>
  );
};

export default VegaChartComponent;
