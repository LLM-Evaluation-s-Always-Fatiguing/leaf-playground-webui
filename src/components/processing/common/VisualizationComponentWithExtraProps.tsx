'use client';

import React from 'react';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';

function VisualizationComponentWithExtraProps<P extends DefaultProcessingVisualizationComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  extraProps: Omit<P, 'logs'>
) {
  const ComponentWithExtraProps: React.FC<DefaultProcessingVisualizationComponentProps> = (props) => {
    const finalProps = { ...extraProps, ...props } as P;
    return <WrappedComponent {...finalProps} />;
  };
  return ComponentWithExtraProps;
}

export default VisualizationComponentWithExtraProps;