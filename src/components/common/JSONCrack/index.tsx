import React, { useRef, useEffect } from 'react';
import { useTheme } from 'antd-style';

interface JsonCrackViewerProps {
  jsonObject?: object | any[];
}

const JsonCrackViewer = (props: JsonCrackViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();

  const sendToEmbed = (jsonObject: object | any[]) => {
    if (iframeRef.current) {
      const jsonStr = JSON.stringify(jsonObject);
      iframeRef.current?.contentWindow?.postMessage(
        {
          json: jsonStr,
          options: {
            theme: theme.appearance === 'dark' ? 'dark' : 'light',
            direction: 'RIGHT', // "UP", "DOWN", "LEFT", "RIGHT"
          },
        },
        '*'
      );
    }
  };

  useEffect(() => {
    if (props.jsonObject) {
      sendToEmbed(props.jsonObject);
    }
  }, [props.jsonObject]);

  return (
    <iframe
      ref={iframeRef}
      src="https://jsoncrack.com/widget"
      style={{ width: '100%', height: '100%', border: 'none' }}
      onLoad={() => {
        if (props.jsonObject) {
          sendToEmbed(props.jsonObject);
        }
      }}
    />
  );
};

export default JsonCrackViewer;
