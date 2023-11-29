'use client';

import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from 'antd-style';

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
