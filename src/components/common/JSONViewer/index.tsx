'use client';

import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from 'antd-style';

interface JSONViewerProps {
  jsonObject?: object;
}

const JSONViewer = (props: JSONViewerProps) => {
  const theme = useTheme();
  return <JsonViewer theme={theme.appearance as 'light' | 'dark'} value={props.jsonObject} />;
};

export default JSONViewer;
