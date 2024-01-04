'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import WebUIAgentInstance, { getAllAgentInstanceFrom } from '@/types/api-router/webui/AgentInstance';
import { SceneActionLog } from '@/types/server/Log';
import { Button, Slider, Tabs } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import keyBy from 'lodash/keyBy';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { IoMdLocate } from 'react-icons/io';
import SampleAvatar from '@/components/processing/common/SampleAvatar';
import SampleStatusAvatar from '@/components/processing/common/SampleStatusAvatar';
import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import GodViewButton from '@/components/processing/specialized/who-is-the-spy/GodViewButton';
import PlayerCard from '@/components/processing/specialized/who-is-the-spy/PlayerCard';
import RoleAvatar from '@/components/processing/specialized/who-is-the-spy/RoleAvatar';
import { PresenterIcon } from '@/components/processing/specialized/who-is-the-spy/icons/PresenterIcon';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';
import DeskImage from './assets/game_table.svg';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;

  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }
`;

const MainArea = styled.div`
  flex-grow: 1;
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
  position: relative;

  .godViewButton {
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 3;
  }

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
    align-self: flex-start;
    padding: 15px 15px 15px 0;
    flex-grow: 1;
    max-height: 100%;
    overflow: hidden auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
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

function splitLogs(logs: SceneActionLog[], by: 'game' | 'round'): SceneActionLog[][] {
  if (logs.length === 0) return [];
  const result: SceneActionLog[][] = [];
  let currentSegment: SceneActionLog[] = [];
  const byKey = by === 'game' ? 'game_id' : 'round_id';
  let lastID = logs[0][byKey];
  logs.forEach((log) => {
    if (lastID !== log[byKey]) {
      result.push(currentSegment);
      currentSegment = [];
    }
    lastID = log[byKey];
    currentSegment.push(log);
  });
  if (currentSegment.length > 0) {
    result.push(currentSegment);
  }
  return result;
}

interface GameAgentsInfo {
  agentRoleMap: Record<string, 'civilian' | 'spy' | 'blank'>;
  keys: {
    civilian: string;
    spy: string;
  };
  agentLiveStatus: Record<string, boolean>;
  finished: boolean;
  winners: string[];
}

function calculateGameAgentsInfo(gameLogs: SceneActionLog[], allAgent: WebUIAgentInstance[]) {
  const info: GameAgentsInfo = {
    agentRoleMap: {},
    keys: {
      civilian: '',
      spy: '',
    },
    agentLiveStatus: allAgent.reduce(
      (acc, agent) => {
        acc[agent.config.config_data.profile.name] = true;
        return acc;
      },
      {} as Record<string, boolean>
    ),
    finished: false,
    winners: [],
  };
  if (gameLogs[0]?.response) {
    const role2players = gameLogs[0].response.role2players;
    const agentRoleMap: Record<string, 'civilian' | 'spy' | 'blank'> = {};
    for (let role in role2players) {
      role2players[role].forEach((agentName: string) => {
        agentRoleMap[agentName] = role as 'civilian' | 'spy' | 'blank';
      });
    }
    info.agentRoleMap = agentRoleMap;
    info.keys = gameLogs[0].response.keys;
  }
  for (let i = 1; i < gameLogs.length; i++) {
    const log = gameLogs[i];
    if (log.action_belonged_chain === 'moderator.summarize_player_votes') {
      const player_received_votes: Record<string, number> = log.response.player_received_votes;
      let maxVotes = 0;
      let maxVotedAgents: string[] = [];
      for (let agentName in player_received_votes) {
        const votes = player_received_votes[agentName];
        if (votes > maxVotes) {
          maxVotes = votes;
          maxVotedAgents = [agentName];
        } else if (votes === maxVotes) {
          maxVotedAgents.push(agentName);
        }
      }
      if (maxVotedAgents.length === 1) {
        info.agentLiveStatus[maxVotedAgents[0]] = false;
      }
    }
    if (log.action_belonged_chain === 'moderator.check_if_game_over') {
      info.finished = log.response.is_game_over;
      if (log.response.is_game_over) {
        info.winners = log.response.winners || [];
      }
    }
  }
  return info;
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

  const { allAgents, agentMapKeyById, deskSeatAgentsMap } = useMemo(() => {
    const agents = getAllAgentInstanceFrom(props.scene, props.createSceneParams);
    const seatsIndex = assignSeats(agents.length);
    const topSeatAgents: WebUIAgentInstance[] = [];
    const rightSeatAgents: WebUIAgentInstance[] = [];
    const bottomSeatAgents: WebUIAgentInstance[] = [];
    const leftSeatAgents: WebUIAgentInstance[] = [];
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
      agentMapKeyById: keyBy(agents, (c) => c.config.config_data.profile.id),
      deskSeatAgentsMap: {
        top: topSeatAgents,
        right: rightSeatAgents,
        bottom: bottomSeatAgents,
        left: leftSeatAgents,
      } as Record<string, WebUIAgentInstance[]>,
    };
  }, [props.scene, props.createSceneParams]);

  const splitGamesLogs = useMemo(() => {
    return splitLogs(props.logs, 'game');
  }, [props.logs]);
  const [currentGame, setCurrentGame] = useState(1);
  const currentGameLogs = useMemo(() => {
    return splitGamesLogs[currentGame - 1] || [];
  }, [splitGamesLogs, currentGame]);
  const [currentRound, setCurrentRound] = useState(1);
  const { splitRoundLogs, sliderMarks } = useMemo(() => {
    const splitRoundLogs = splitLogs(currentGameLogs, 'round');
    const sliderMarks: Record<string, string> = {};
    for (let i = 0; i < splitRoundLogs.length; i++) {
      sliderMarks[i + 1] = `${i + 1}`;
    }
    return {
      splitRoundLogs,
      sliderMarks,
    };
  }, [currentGameLogs]);
  const currentRoundLogs = useMemo(() => {
    return splitRoundLogs[currentRound - 1] || [];
  }, [splitRoundLogs, currentRound]);
  const displayLogs = useMemo(() => {
    if (!props.targetAgentId) {
      return currentRoundLogs;
    }
    return currentRoundLogs.filter(
      (log) =>
        log.response.sender.id === props.targetAgentId ||
        log.response.receivers.map((r) => r.id).includes(props.targetAgentId || '')
    );
  }, [currentRoundLogs, props.targetAgentId]);
  const currentGameInfo = useMemo(() => {
    return calculateGameAgentsInfo(splitRoundLogs.slice(0, currentRound).flat(), allAgents);
  }, [splitRoundLogs, currentRound, allAgents]);
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
  const sortedAllAgents = useMemo(() => {
    return [...allAgents].sort((a, b) => {
      const aLive = currentGameInfo.agentLiveStatus[a.config.config_data.profile.name];
      const bLive = currentGameInfo.agentLiveStatus[b.config.config_data.profile.name];
      const aWin = currentGameInfo.winners.includes(a.config.config_data.profile.name);
      const bWin = currentGameInfo.winners.includes(b.config.config_data.profile.name);
      if (aWin && !bWin) return -1;
      else if (!aWin && bWin) return 1;
      if (aLive && !bLive) return -1;
      else if (!aLive && bLive) return 1;
      else return 0;
    });
  }, [allAgents, currentGameInfo]);
  useEffect(() => {
    if (autoPlay) {
      setCurrentGame(splitGamesLogs.length);
      setCurrentRound(splitRoundLogs.length);
      if (chatScrollAreaRef.current) {
        chatScrollAreaRef.current.scrollTo({
          top: chatScrollAreaRef.current.scrollHeight,
        });
      }
    }
  }, [autoPlay, splitGamesLogs, splitRoundLogs, currentRoundLogs]);

  return (
    <Container>
      <Tabs
        type={'card'}
        activeKey={`${currentGame}`}
        onChange={(key) => {
          setAutoPlay(false);
          setCurrentGame(parseInt(key));
          setCurrentRound(1);
        }}
        items={splitGamesLogs.map((logs, index) => {
          return {
            key: `${index + 1}`,
            label: `Game ${index + 1}`,
          };
        })}
      />
      <MainArea>
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
          {splitRoundLogs.length > 1 && (
            <Slider
              style={{
                position: 'relative',
                left: '-6px',
                height: `min(100%, ${splitRoundLogs.length * 45}px)`,
              }}
              vertical
              reverse
              value={currentRound}
              min={1}
              max={splitRoundLogs.length}
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
                      const agentName = agent.config.config_data.profile.name;
                      let agentStatus: 'silence' | 'speaking' | 'done' = 'silence';
                      if (currentRound !== 1) {
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
                              agentStatus = spokenIds.includes(agent.config.config_data.profile.id)
                                ? 'done'
                                : 'speaking';
                            }
                            break;
                          default:
                            agentStatus = 'silence';
                            break;
                        }
                      }
                      const live = currentGameInfo.agentLiveStatus[agentName];
                      const role = currentGameInfo.agentRoleMap[agentName];
                      return (
                        <SampleStatusAvatar
                          key={agent.config.config_data.profile.id}
                          status={live ? agentStatus : 'silence'}
                          style={{
                            color: agent.config.config_data.chart_major_color,
                            ...(live ? {} : { opacity: 0.35, filter: 'grayscale(60%)' }),
                          }}
                        >
                          <RoleAvatar role={godView ? role : undefined} />
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
              {sortedAllAgents.map((agent) => {
                const agentName = agent.config.config_data.profile.name;
                const live = currentGameInfo.agentLiveStatus[agentName];
                const win = currentGameInfo.winners.includes(agentName);
                const role = currentGameInfo.agentRoleMap[agentName];
                const gameKey = role !== 'blank' ? currentGameInfo.keys[role] : '';
                return (
                  <PlayerCard
                    key={agent.config.config_data.profile.id}
                    godView={godView}
                    live={live}
                    win={win}
                    role={role}
                    gameKey={gameKey}
                    agent={agent}
                  />
                );
              })}
            </div>
            {!props.playerMode && (
              <div className="godViewButton">
                <GodViewButton
                  godView={godView}
                  onGodViewChange={(newValue) => {
                    setGodView(newValue);
                  }}
                />
              </div>
            )}
          </StatusArea>
          <ChatsArea
            ref={chatScrollAreaRef}
            onWheelCapture={() => {
              setAutoPlay(false);
            }}
          >
            {displayLogs.map((log, index) => {
              const isPlayer = log.action_belonged_chain?.startsWith('player');
              const agentInstance = agentMapKeyById[log.response.sender.id];
              const avatarColor = isPlayer ? agentInstance?.config.config_data.chart_major_color : theme.colorPrimary;
              const role = isPlayer
                ? currentGameInfo.agentRoleMap[agentInstance?.config.config_data.profile.name]
                : undefined;
              return (
                <div key={index} className={isPlayer ? 'player' : 'moderator'}>
                  <SampleAvatar
                    style={{
                      color: avatarColor,
                    }}
                  >
                    {isPlayer ? <RoleAvatar role={godView ? role : undefined} /> : <PresenterIcon />}
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
                    <div className="body">{getSceneLogMessageDisplayContent(log.response, true)}</div>
                  </div>
                </div>
              );
            })}
          </ChatsArea>
        </Playground>
      </MainArea>
    </Container>
  );
};

export default WhoIsTheSpyVisualization;
