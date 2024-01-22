'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SceneActionLog } from '@/types/server/common/Log';
import SceneAgentConfig from '@/types/server/config/Agent';
import { Button, Slider, Space } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import keyBy from 'lodash/keyBy';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { GiTeacher } from 'react-icons/gi';
import { IoMdLocate } from 'react-icons/io';
import { RiRobot2Fill } from 'react-icons/ri';
import SampleAvatar from '@/app/processing/components/common/SampleAvatar';
import SampleStatusAvatar from '@/app/processing/components/common/SampleStatusAvatar';
import { DefaultProcessingVisualizationComponentProps } from '@/app/processing/components/def';
import useGlobalStore from '@/stores/global';
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
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
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
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
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
    const result: SceneActionLog[][] = [];
    let currentGroup: SceneActionLog[] = [];
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

  const allAgents = Object.entries(
    globalStore.createSceneTaskParams?.scene_obj_config.scene_config_data.roles_config || {}
  ).reduce((total, [roleName, roleConfig]) => {
    return [...total, ...(roleConfig.agents_config || [])];
  }, [] as SceneAgentConfig[]);

  return (
    <Container>
      <div className="simulateArea">
        <SampleStatusAvatar status={currentDisplayLogs.some((l) => !l.references) ? 'done' : 'speaking'}>
          <AskerAvatar size={'1em'} />
        </SampleStatusAvatar>
        <Space wrap size={[4, 8]}>
          {allAgents.map((agent) => {
            return (
              <SampleStatusAvatar
                key={agent.config_data.profile.id}
                status={
                  !currentDisplayLogs.some((l) => !l.references)
                    ? 'silence'
                    : currentDisplayLogs.some((l) => l.response.sender.id === agent.config_data.profile.id)
                      ? 'done'
                      : 'speaking'
                }
                style={{
                  color: agent.config_data.chart_major_color,
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
          const agentMap = keyBy(allAgents, (c) => c.config_data.profile.id);
          const avatarColor = isAnswerer
            ? agentMap[log.response.sender.id]?.config_data.chart_major_color
            : theme.colorPrimary;
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
                <div className="header">
                  {log.log_msg}
                  <Button
                    size="small"
                    type="text"
                    style={{
                      fontSize: '18px',
                      lineHeight: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    icon={<IoMdLocate size={'1em'} />}
                    onClick={() => {
                      props.needScrollToLog?.(log.id);
                    }}
                  />
                </div>
                <div className="body">{getSceneLogMessageDisplayContent(log.response, true, props.project.id)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default SampleQAVisualization;
