'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { SceneActionLog } from '@/types/server/Log';
import SceneAgentConfig from '@/types/server/config/Agent';
import { Button, Slider } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import keyBy from 'lodash/keyBy';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { RiRobot2Fill } from 'react-icons/ri';
import SampleAvatar from '@/components/processing/common/SampleAvatar';
import SampleStatusAvatar from '@/components/processing/common/SampleStatusAvatar';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import PlayerCard from '@/components/processing/specialized/who-is-the-spy/PlayerCard';
import { PresenterIcon } from '@/components/processing/specialized/who-is-the-spy/icons/PresenterIcon';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import DeskImage from './assets/game_table.svg';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;
`;

const RoundArea = styled.div`
  padding: 10px 4px 20px 4px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  border-right: 1px solid ${(props) => props.theme.dividerColor};
`;

const Playground = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const StatusArea = styled.div`
  height: 260px;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .deskArea {
    margin: 15px;
    width: 230px;
    height: 230px;
    flex-shrink: 0;
    position: relative;

    .deskImage {
      position: absolute;
      top: 40px;
      left: 40px;
      width: 150px;
      height: 150px;
      z-index: 1;
    }

    .topSeats {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 40px;
      z-index: 2;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: stretch;
      gap: 5px;
    }

    .rightSeats {
      position: absolute;
      right: 0;
      top: 45px;
      width: 40px;
      bottom: 45px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      gap: 5px;
    }

    .bottomSeats {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 40px;
      z-index: 2;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: stretch;
      gap: 5px;
    }

    .leftSeats {
      position: absolute;
      left: 0;
      top: 45px;
      width: 40px;
      bottom: 45px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      gap: 5px;
    }

    .centerSeat {
      position: absolute;
      left: 95px;
      top: 95px;
      width: 40px;
      height: 40px;
      z-index: 3;
    }
  }

  .playersArea {
    padding: 15px 15px 15px 0;
    flex-grow: 1;
    height: 100%;
    overflow: hidden auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }
`;

const ChatsArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden auto;
  padding: 16px 12px;
  border-top: 1px solid ${(props) => props.theme.dividerColor};

  .moderator {
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
        padding: 16px 12px;
        border-radius: 0 0 6px 6px;
        background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
      }
    }
  }

  .player {
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
        padding: 16px 12px;
        border-radius: 0 0 6px 6px;
        background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
      }
    }
  }

  .moderator + .moderator {
    margin-top: 12px;
  }

  .moderator + .player {
    margin-top: 12px;
  }

  .player + .player {
    margin-top: 12px;
  }

  .player + .moderator {
    margin-top: 12px;
  }
`;

function splitLogsToRoundLogs(logs: SceneActionLog[]): SceneActionLog[][] {
  const result: SceneActionLog[][] = [];
  let currentSegment: SceneActionLog[] = [];

  logs.forEach((log) => {
    currentSegment.push(log);
    if (log.action_belonged_chain === 'moderator.check_if_game_over') {
      result.push(currentSegment);
      currentSegment = [];
    }
  });

  if (currentSegment.length > 0) {
    result.push(currentSegment);
  }

  return result;
}

type RoundStageKey = 'preparation' | 'description' | 'prediction' | 'voting' | 'checkOver';

enum RoundStageProgress {
  PREPARATION = 'preparation',
  DESCRIPTION = 'description',
  PREDICTION = 'prediction',
  VOTING = 'voting',
  CHECK_OVER = 'checkOver',
  ALL_DONE = 'allDone',
}

interface RoundStageProgressInfo {
  logs: SceneActionLog[];
  progress?: string;
  done: boolean;
}

interface RoundRepeatableStageProgressInfo {
  logs: SceneActionLog[][];
  progress?: string;
  executionCount: number;
  done: boolean;
}

interface RoundProgressInfo {
  preparation: RoundStageProgressInfo;
  description: RoundRepeatableStageProgressInfo;
  prediction: RoundRepeatableStageProgressInfo;
  voting: RoundRepeatableStageProgressInfo;
  checkOver: RoundStageProgressInfo;
  progress?: RoundStageProgress;
}

function calculateRoundProgress(roundLogs: SceneActionLog[], agentCount: number) {
  const stagesOrderArr: RoundStageKey[] = ['preparation', 'description', 'prediction', 'voting', 'checkOver'];
  const stageActionsMap: Record<RoundStageKey, string[]> = {
    preparation: [
      'moderator.init_game',
      'moderator.introduce_game_rule',
      'moderator.announce_game_start',
      'moderator.assign_keys',
    ],
    description: ['moderator.ask_for_key_description', 'player.describe_key'],
    prediction: ['moderator.ask_for_role_prediction', 'player.predict_role', 'moderator.summarize_players_prediction'],
    voting: ['moderator.ask_for_vote', 'player.vote', 'moderator.summarize_player_votes'],
    checkOver: ['moderator.check_if_game_over'],
  };

  const roundProgressInfo: RoundProgressInfo = {
    preparation: { logs: [], progress: undefined, done: false },
    description: { logs: [], progress: undefined, executionCount: 0, done: false },
    prediction: { logs: [], progress: undefined, executionCount: 0, done: false },
    voting: { logs: [], progress: undefined, executionCount: 0, done: false },
    checkOver: { logs: [], progress: undefined, done: false },
    progress: undefined,
  };

  let lastStage: RoundStageKey = 'preparation';
  roundLogs.forEach((log) => {
    for (const stage of stagesOrderArr) {
      const actions = stageActionsMap[stage];
      if (actions.includes(log.action_belonged_chain)) {
        if (stage === 'description' || stage === 'prediction' || stage === 'voting') {
          if (lastStage !== stage) {
            roundProgressInfo[stage].executionCount++;
            roundProgressInfo[stage].logs.push([]);
          }
          roundProgressInfo[stage].logs[roundProgressInfo[stage].logs.length - 1].push(log);
        } else {
          roundProgressInfo[stage].logs.push(log);
        }
        lastStage = stage;
        roundProgressInfo[stage].progress = log.action_belonged_chain;
        break;
      }
    }
  });

  if (roundProgressInfo.preparation.logs.length >= 3 + agentCount) {
    roundProgressInfo.preparation.done = true;
  }
  if (
    roundProgressInfo.description.logs.length &&
    roundProgressInfo.description.logs[roundProgressInfo.description.logs.length - 1].length >= 1 + agentCount * 2
  ) {
    roundProgressInfo.description.done = true;
  }
  if (
    roundProgressInfo.prediction.logs.length &&
    roundProgressInfo.prediction.logs[roundProgressInfo.prediction.logs.length - 1].length >= 2 + agentCount
  ) {
    roundProgressInfo.prediction.done = true;
  }
  if (
    roundProgressInfo.voting.logs.length &&
    roundProgressInfo.voting.logs[roundProgressInfo.voting.logs.length - 1].length >= 2 + agentCount
  ) {
    roundProgressInfo.voting.done = true;
  }
  if (roundProgressInfo.checkOver.logs.length > 0) {
    roundProgressInfo.checkOver.done = true;
  }

  if (roundProgressInfo.checkOver.done) {
    roundProgressInfo.progress = RoundStageProgress.ALL_DONE;
  } else {
    if (roundProgressInfo[lastStage].done) {
      const index = stagesOrderArr.indexOf(lastStage);
      if (index < stagesOrderArr.length - 1) {
        lastStage = stagesOrderArr[index + 1];
      }
    }
    roundProgressInfo.progress = lastStage as RoundStageProgress;
  }

  return roundProgressInfo;
}

function assignSeats(n: number) {
  const totalSeats = 16;
  let assignedSeats = new Array(totalSeats).fill(false);

  const middleSeats = [2, 6, 10, 14];
  const sideSeats = [1, 3, 5, 7, 9, 11, 13, 15];
  const cornerSeats = [0, 4, 8, 12];

  for (let i = 0; i < Math.min(n, middleSeats.length); i++) {
    assignedSeats[middleSeats[i]] = true;
  }

  if (n > middleSeats.length) {
    let remaining = n - middleSeats.length;
    let interval = Math.floor(sideSeats.length / remaining);
    for (let i = 0, seatIndex = 0; i < remaining; i++) {
      assignedSeats[sideSeats[seatIndex]] = true;
      seatIndex = (seatIndex + interval) % sideSeats.length;
    }
  }

  if (n > middleSeats.length + sideSeats.length) {
    let remaining = n - (middleSeats.length + sideSeats.length);
    for (let i = 0; i < remaining; i++) {
      assignedSeats[cornerSeats[i]] = true;
    }
  }

  return assignedSeats.map((seat, index) => (seat ? index : null)).filter((index) => index !== null) as number[];
}

interface WhoIsTheSpyVisualizationProps extends DefaultProcessingVisualizationComponentProps {}

const WhoIsTheSpyVisualization = (props: WhoIsTheSpyVisualizationProps) => {
  const theme = useTheme();

  const [godView, setGodView] = useState(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  const [currentRound, setCurrentRound] = useState(1);
  const { splitLogs, sliderMarks } = useMemo(() => {
    const splitLogs = splitLogsToRoundLogs(props.logs);
    const sliderMarks: Record<string, string> = {};
    for (let i = 0; i < splitLogs.length; i++) {
      sliderMarks[i + 1] = `${i + 1}`;
    }
    return {
      splitLogs,
      sliderMarks,
    };
  }, [props.logs]);

  const { allAgents, deskSeatAgentsMap } = useMemo(() => {
    const agents: SceneAgentConfig[] = [];
    Object.entries(props.createSceneParams.scene_obj_config.scene_config_data.roles_config).forEach(
      ([roleName, roleConfig]) => {
        agents.push(...(roleConfig.agents_config || []));
      }
    );
    const seatsIndex = assignSeats(agents.length);
    const topSeatAgents: SceneAgentConfig[] = [];
    const rightSeatAgents: SceneAgentConfig[] = [];
    const bottomSeatAgents: SceneAgentConfig[] = [];
    const leftSeatAgents: SceneAgentConfig[] = [];
    agents.forEach((agent, index) => {
      const seatIndex = seatsIndex[index];
      if (seatIndex < 5) {
        topSeatAgents.push(agent);
      } else if (seatIndex < 8) {
        rightSeatAgents.push(agent);
      } else if (seatIndex < 13) {
        bottomSeatAgents.push(agent);
      } else {
        leftSeatAgents.push(agent);
      }
    });
    return {
      allAgents: agents,
      deskSeatAgentsMap: {
        top: topSeatAgents,
        right: rightSeatAgents,
        bottom: bottomSeatAgents,
        left: leftSeatAgents,
      } as Record<string, SceneAgentConfig[]>,
    };
  }, [props.createSceneParams]);

  const currentRoundLogs = useMemo(() => {
    return splitLogs[currentRound - 1] || [];
  }, [splitLogs, currentRound]);
  const roundProgress = useMemo(() => {
    return calculateRoundProgress(currentRoundLogs, allAgents.length);
  }, [currentRoundLogs, allAgents]);
  const moderatorStatus: 'silence' | 'speaking' | 'done' = useMemo(() => {
    const agentCount = allAgents.length;
    switch (roundProgress.progress) {
      case RoundStageProgress.DESCRIPTION: {
        if (roundProgress.description.logs.length === 0 || roundProgress.description.done) {
          return 'speaking';
        }
        return 'done';
      }
      case RoundStageProgress.PREDICTION: {
        if (roundProgress.prediction.logs.length === 0 || roundProgress.prediction.done) {
          return 'speaking';
        }
        const logLength = roundProgress.prediction.logs[roundProgress.prediction.logs.length - 1].length;
        if (logLength >= 1 + agentCount) {
          return 'speaking';
        }
        return 'done';
      }
      case RoundStageProgress.VOTING: {
        if (roundProgress.voting.logs.length === 0 || roundProgress.voting.done) {
          return 'speaking';
        }
        const logLength = roundProgress.voting.logs[roundProgress.voting.logs.length - 1].length;
        if (logLength >= 1 + agentCount) {
          return 'speaking';
        }
        return 'done';
      }
      case RoundStageProgress.PREPARATION:
      case RoundStageProgress.CHECK_OVER:
        return 'speaking';
      case RoundStageProgress.ALL_DONE:
        return 'done';
    }
    return 'silence';
  }, [roundProgress, allAgents]);

  useEffect(() => {
    if (autoPlay) {
      setCurrentRound(splitLogs.length);
      if (chatScrollAreaRef.current) {
        chatScrollAreaRef.current.scrollTo({
          top: chatScrollAreaRef.current.scrollHeight,
        });
      }
    }
  }, [autoPlay, splitLogs]);

  useEffect(() => {
    if (autoPlay && chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTo({
        top: chatScrollAreaRef.current.scrollHeight,
      });
    }
  }, [props.logs]);

  return (
    <Container>
      <RoundArea>
        <div className="title">Round</div>
        <Button
          type={'text'}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '6px 0',
          }}
          size={'small'}
          icon={autoPlay ? <FaPause size={'1em'} /> : <FaPlay size={'1em'} />}
          onClick={() => {
            setAutoPlay(!autoPlay);
          }}
        />
        {splitLogs.length > 1 && (
          <Slider
            style={{
              position: 'relative',
              left: '-6px',
              height: `min(100%, ${splitLogs.length * 45}px)`,
            }}
            vertical
            reverse
            value={currentRound}
            min={1}
            max={splitLogs.length}
            step={1}
            marks={sliderMarks}
            onChange={(value) => {
              setCurrentRound(value);
              setAutoPlay(false);
              if (chatScrollAreaRef.current) {
                chatScrollAreaRef.current.scrollTo({
                  top: 0,
                });
              }
            }}
          />
        )}
      </RoundArea>
      <Playground>
        <StatusArea>
          <div className="deskArea">
            <div className="deskImage">
              <Image fill src={DeskImage} alt={''} />
            </div>
            {Object.keys(deskSeatAgentsMap).map((seatSide) => {
              return (
                <div key={seatSide} className={`${seatSide}Seats`}>
                  {deskSeatAgentsMap[seatSide].map((agent, index) => {
                    let agentStatus: 'silence' | 'speaking' | 'done' = 'silence';
                    switch (roundProgress.progress) {
                      case RoundStageProgress.DESCRIPTION:
                      case RoundStageProgress.PREDICTION:
                      case RoundStageProgress.VOTING:
                        {
                          if (
                            roundProgress[roundProgress.progress].done ||
                            roundProgress[roundProgress.progress].logs.length === 0
                          )
                            return 'silence';
                          const spokenIds = roundProgress[roundProgress.progress].logs[
                            roundProgress[roundProgress.progress].logs.length - 1
                          ].map((log) => log.response.sender.id);
                          agentStatus = spokenIds.includes(agent.config_data.profile.id) ? 'done' : 'speaking';
                        }
                        break;
                      default:
                        agentStatus = 'silence';
                        break;
                    }
                    return (
                      <SampleStatusAvatar
                        key={agent.config_data.profile.id}
                        status={agentStatus}
                        style={{
                          color: agent.config_data.chart_major_color,
                        }}
                      >
                        <RiRobot2Fill size={'1em'} />
                      </SampleStatusAvatar>
                    );
                  })}
                </div>
              );
            })}
            <div className="centerSeat">
              <SampleStatusAvatar
                status={moderatorStatus}
                style={{
                  color: '#FCCF7F',
                  fontSize: '32px',
                }}
              >
                <PresenterIcon />
              </SampleStatusAvatar>
            </div>
          </div>
          <div className="playersArea">
            {allAgents.map((agent) => {
              return <PlayerCard key={agent.config_data.profile.id} agent={agent} />;
            })}
          </div>
        </StatusArea>
        <ChatsArea
          ref={chatScrollAreaRef}
          onWheelCapture={() => {
            setAutoPlay(false);
          }}
        >
          {currentRoundLogs.map((log, index) => {
            const isPlayer = log.action_belonged_chain?.startsWith('player');
            const agentMap = keyBy(allAgents, (c) => c.config_data.profile.id);
            const avatarColor = isPlayer
              ? agentMap[log.response.sender.id]?.config_data.chart_major_color
              : theme.colorPrimary;
            return (
              <div key={index} className={isPlayer ? 'player' : 'moderator'}>
                <SampleAvatar
                  style={{
                    color: avatarColor,
                  }}
                >
                  {isPlayer ? <RiRobot2Fill size={'1em'} /> : <PresenterIcon />}
                </SampleAvatar>
                <div className="card">
                  <div className="header">{log.log_msg}</div>
                  <div className="body">{getSceneLogMessageDisplayContent(log.response, true)}</div>
                </div>
              </div>
            );
          })}
        </ChatsArea>
      </Playground>
    </Container>
  );
};

export default WhoIsTheSpyVisualization;
