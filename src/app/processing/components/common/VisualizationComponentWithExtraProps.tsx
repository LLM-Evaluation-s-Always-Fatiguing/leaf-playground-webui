'use client';

import React from 'react';
import { DefaultProcessingVisualizationComponentProps } from '@/app/processing/components/def';

function VisualizationComponentWithExtraProps<P extends DefaultProcessingVisualizationComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  extraProps: Pick<P, Exclude<keyof P, keyof DefaultProcessingVisualizationComponentProps>>
) {
  const ComponentWithExtraProps: React.FC<DefaultProcessingVisualizationComponentProps> = (props) => {
    const finalProps = { ...extraProps, ...props } as P;
    return <WrappedComponent {...finalProps} />;
  };
  return ComponentWithExtraProps;
}

export default VisualizationComponentWithExtraProps;
