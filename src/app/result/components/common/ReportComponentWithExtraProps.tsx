'use client';

import React from 'react';
import { DefaultResultReportComponentProps } from '@/app/result/components/def';

function ResultReportComponentWithExtraProps<P extends DefaultResultReportComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  extraProps: Pick<P, Exclude<keyof P, keyof DefaultResultReportComponentProps>>
) {
  const ComponentWithExtraProps: React.FC<DefaultResultReportComponentProps> = (props) => {
    const finalProps = { ...extraProps, ...props } as P;
    return <WrappedComponent {...finalProps} />;
  };
  return ComponentWithExtraProps;
}

export default ResultReportComponentWithExtraProps;
