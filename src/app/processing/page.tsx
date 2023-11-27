'use client';

import styled from '@emotion/styled';
import totalSceneConfig from '@/utils/temp/scene-config';
import { useEffect, useRef, useState } from 'react';
import { RiRobot2Fill } from 'react-icons/ri';
import { GiTeacher } from 'react-icons/gi';

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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden scroll;
  padding: 16px 12px;

  border-right: 1px solid ${(props) => props.theme.dividerColor};

  .examiner {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 21px;
      background: ${(props) => props.theme.colorFillSecondary};
      color: ${(props) => props.theme.colorPrimary};
    }

    .card {
      margin-left: 8px;
      max-width: calc(100% - 88px);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .header {
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
        display: flex;
        flex-direction: column;
        white-space: pre-line;
        padding: 16px 12px;
      }
    }
  }

  .examinee {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: flex-start;

    .avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 21px;
      background: ${(props) => props.theme.colorFillSecondary};
      color: ${(props) => props.theme.colorPrimary};
    }

    .card {
      margin-right: 8px;
      max-width: calc(100% - 88px);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .header {
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        white-space: pre-line;
        padding: 16px 12px;
        text-align: right;
      }
    }
  }

  .examiner + .examinee {
    margin-top: 12px;
  }

  .examinee + .examinee {
    margin-top: 12px;
  }

  .examinee + .examiner {
    margin-top: 12px;
  }
`;

const ProcessingPage = () => {
  const config = totalSceneConfig.config;

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/run_scene');
    ws.onopen = () => {
      console.log('WebSocket opened');
      ws.send(JSON.stringify(config));
    };

    ws.onmessage = (event) => {
      const eventData = JSON.parse(JSON.parse(event.data));
      console.log('WebSocket Received Message:', eventData);
      if (eventData.type === 'log') {
        setLogs((prev) => {
          return [...prev, eventData.data];
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed.');
    };

    return () => {
      ws.close();
    };
  }, []);

  const enableAutoScrollToBottomRef = useRef(true);
  const reEnableAutoScrollToBottomTimerRef = useRef<any>();

  useEffect(() => {
    if (!enableAutoScrollToBottomRef.current) return;
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current?.scrollHeight || 0,
      behavior: 'smooth',
    });
  }, [logs]);

  return (
    <PageContainer>
      <VisualizationArea
        ref={scrollAreaRef}
        onWheel={() => {
          if (reEnableAutoScrollToBottomTimerRef.current) {
            clearTimeout(reEnableAutoScrollToBottomTimerRef.current);
          }
          enableAutoScrollToBottomRef.current = false;
          reEnableAutoScrollToBottomTimerRef.current = setTimeout(() => {
            enableAutoScrollToBottomRef.current = true;
            reEnableAutoScrollToBottomTimerRef.current = undefined;
          }, 1000);
        }}
      >
        {logs.map((log, index) => {
          return (
            <div key={index} className={log.references ? 'examinee' : 'examiner'}>
              <div className="avatar">
                {log.references ? <RiRobot2Fill size={'1em'} /> : <GiTeacher size={'1em'} />}
              </div>
              <div className="card">
                <div className="header">{log.narrator}</div>
                <div className="body">{log.response.content.text}</div>
              </div>
            </div>
          );
        })}
      </VisualizationArea>
    </PageContainer>
  );
};

export default ProcessingPage;
