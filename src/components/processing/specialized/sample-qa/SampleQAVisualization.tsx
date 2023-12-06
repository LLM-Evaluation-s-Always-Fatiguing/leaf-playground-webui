'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import styled from '@emotion/styled';
import { RiRobot2Fill } from 'react-icons/ri';
import { GiTeacher } from 'react-icons/gi';
import { FaPlay, FaPause } from 'react-icons/fa6';
import SceneLog, { SceneLogTextContent } from '@/types/server/Log';
import useGlobalStore from '@/stores/global';
import { useTheme } from 'antd-style';
import keyBy from 'lodash/keyBy';
import { Button, Slider, Space } from 'antd';
import SampleStatusAvatar from '@/components/processing/common/SampleStatusAvatar';
import SampleAvatar from '@/components/processing/common/SampleAvatar';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;

  .simulateArea {
    flex-shrink: 0;
    padding: 16px 12px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;

    overflow: hidden;
  }

  .timeLineArea {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0 16px;
  }

  .detailArea {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden auto;
    padding: 16px 12px;
  }

  .asker {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

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
        border-radius: 0 0 6px 6px;
        background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
      }
    }
  }

  .answerer {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: flex-start;

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
        word-break: break-all;
        padding: 16px 12px;
        border-radius: 0 0 6px 6px;
        background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
      }
    }
  }

  .asker + .answerer {
    margin-top: 12px;
  }

  .answerer + .answerer {
    margin-top: 12px;
  }

  .answerer + .asker {
    margin-top: 12px;
  }
`;

interface SampleQAVisualizationProps extends DefaultProcessingVisualizationComponentProps {
  askerAvatar?: React.ComponentType<{
    size: string;
  }>;
  answererAvatar?: React.ComponentType<{
    size: string;
  }>;
}

const SampleQAVisualization = (props: SampleQAVisualizationProps) => {
  const theme = useTheme();
  const globalStore = useGlobalStore();

  const AskerAvatar = props.askerAvatar || GiTeacher;
  const AnswererAvatar = props.answererAvatar || RiRobot2Fill;

  const [currentQAPartIndex, setCurrentQAPartIndex] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  const splitLogs = useMemo(() => {
    const result: SceneLog[][] = [];
    let currentGroup: SceneLog[] = [];
    props.logs.forEach((log) => {
      if (!log.references) {
        if (currentGroup.length > 0) {
          result.push(currentGroup);
        }
        currentGroup = [];
      }
      currentGroup.push(log);
    });
    if (currentGroup.length > 0) {
      result.push(currentGroup);
    }
    return result;
  }, [props.logs]);

  useEffect(() => {
    if (autoPlay) {
      setCurrentQAPartIndex(splitLogs.length - 1);
    }
  }, [autoPlay, splitLogs]);

  const currentDisplayLogs = splitLogs[currentQAPartIndex] || [];

  return (
    <Container>
      <div className="simulateArea">
        <SampleStatusAvatar status={currentDisplayLogs.some((l) => !l.references) ? 'done' : 'speaking'}>
          <AskerAvatar size={'1em'} />
        </SampleStatusAvatar>
        <Space wrap size={[4, 8]}>
          {(globalStore.agentConfigs || [])
            .filter((a) => !a.profile.role.is_static)
            .map((agent) => {
              return (
                <SampleStatusAvatar
                  key={agent.profile.id}
                  status={
                    !currentDisplayLogs.some((l) => !l.references)
                      ? 'silence'
                      : currentDisplayLogs.some((l) => l.response.sender.id === agent.profile.id)
                        ? 'done'
                        : 'speaking'
                  }
                  style={{
                    color: agent.chart_major_color,
                  }}
                >
                  <AnswererAvatar size={'1em'} />
                </SampleStatusAvatar>
              );
            })}
        </Space>
      </div>
      {splitLogs.length > 1 && (
        <div className="timeLineArea">
          <Slider
            marks={{
              0: '0',
              [splitLogs.length - 1]: splitLogs.length - 1,
            }}
            included={false}
            min={0}
            max={splitLogs.length - 1}
            value={currentQAPartIndex}
            style={{
              flexGrow: 1,
            }}
            onChange={(newValue) => {
              setCurrentQAPartIndex(newValue);
              setAutoPlay(false);
            }}
            step={1}
          />
          <Button
            type={'text'}
            style={{
              marginLeft: '6px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            size={'small'}
            icon={autoPlay ? <FaPause size={'1em'} /> : <FaPlay size={'1em'} />}
            onClick={() => {
              setAutoPlay(!autoPlay);
            }}
          />
        </div>
      )}
      <div className="detailArea">
        {currentDisplayLogs.map((log, index) => {
          const isAnswerer = !!log.references;
          const agentMap = keyBy(globalStore.agentConfigs, (c) => c.profile.id);
          const avatarColor = isAnswerer ? agentMap[log.response.sender.id]?.chart_major_color : theme.colorPrimary;
          return (
            <div key={index} className={isAnswerer ? 'answerer' : 'asker'}>
              <SampleAvatar
                style={{
                  color: avatarColor,
                }}
              >
                {isAnswerer ? <AnswererAvatar size={'1em'} /> : <AskerAvatar size={'1em'} />}
              </SampleAvatar>
              <div className="card">
                <div className="header">{log.narrator}</div>
                <div className="body">{getSceneLogMessageDisplayContent(log.response)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default SampleQAVisualization;
