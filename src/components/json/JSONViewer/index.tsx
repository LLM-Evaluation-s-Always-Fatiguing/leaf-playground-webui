'use client';

import { useTheme } from 'antd-style';
import { JsonViewer } from '@textea/json-viewer';

interface JSONViewerProps {
  jsonObject?: object | any[];
  defaultCollapsed?: boolean;
}

const JSONViewer = (props: JSONViewerProps) => {
  const theme = useTheme();
  return (
    <JsonViewer
      theme={theme.appearance as 'light' | 'dark'}
      value={props.jsonObject}
      defaultInspectDepth={props.defaultCollapsed ? 0 : undefined}
    />
  );
};

export default JSONViewer;
