'use client';

import styled from '@emotion/styled';
import totalSceneConfig from '@/utils/temp/scene-config';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ServerWebSocketLogMessage,
  ServerWebSocketMessage,
  ServerWebSocketMessageType,
} from '@/types/server/web-socket';
import SceneLog from '@/types/server/Log';
import GeneralMCQExamineVisualization from '@/components/processing/specialized/general-mcq-examine/GeneralMCQExamineVisualization';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import VisualizationComponentWithExtraProps from '@/components/processing/common/VisualizationComponentWithExtraProps';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
`;

const VisualizationArea = styled.div`
  width: 45%;
  min-width: 480px;
  height: 100%;
`;

const ProcessingPage = () => {
  const config = totalSceneConfig.config;

  const wsRef = useRef<WebSocket>();

  const [logs, setLogs] = useState<SceneLog[]>([]);

  useEffect(() => {
    if (!wsRef.current) {
      const ws = new WebSocket('ws://127.0.0.1:8000/run_scene');

      ws.onopen = () => {
        console.log('WebSocket opened');
        ws.send(JSON.stringify(config));
      };

      ws.onmessage = (event) => {
        const message: ServerWebSocketMessage = JSON.parse(JSON.parse(event.data));
        console.log('WebSocket Received Message:', message);
        if (message.type === ServerWebSocketMessageType.LOG) {
          const logMessage = message as ServerWebSocketLogMessage;
          setLogs((prev) => {
            return [...prev, message.data];
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed.');
      };

      wsRef.current = ws;
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = undefined;
      }
    };
  }, []);

  function getProcessingVisualizationComponent(): React.FC<DefaultProcessingVisualizationComponentProps> {
    switch (config.scene_info_config_data) {
      default:
        return VisualizationComponentWithExtraProps(GeneralMCQExamineVisualization, {});
      // return () => false;
    }
  }

  const VisualizationComponent = useMemo(() => {
    return getProcessingVisualizationComponent();
  }, [config]);

  return (
    <PageContainer>
      <VisualizationArea>
        <VisualizationComponent logs={logs} />
      </VisualizationArea>
    </PageContainer>
  );
};

export default ProcessingPage;
