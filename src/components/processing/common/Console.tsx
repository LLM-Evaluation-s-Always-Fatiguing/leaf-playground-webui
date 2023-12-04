import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import SceneLog from '@/types/server/Log';
import { Space, Tabs } from 'antd';
import useGlobalStore from '@/stores/global';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ConsoleLogItem from '@/components/processing/common/ConsoleLogItem';
import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import AutoSizer from 'react-virtualized-auto-sizer';
import { newExpression } from '@babel/types';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden;

  .ant-tabs-nav {
    margin-bottom: 0;
  }
`;

const Header = styled.div`
  flex-shrink: 0;
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 21px;
  font-weight: 500;
  padding: 0 16px;

  .connectionStatus {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }

    font-size: 14px;
    font-weight: normal;
  }

  .actionsArea {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }

  > div {
    flex-shrink: 0;
  }
`;

const LogsArea = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

interface ProcessingConsoleProps {
  logs: SceneLog[];
  wsConnected: boolean;
}

const ProcessingConsole = (props: ProcessingConsoleProps) => {
  const theme = useTheme();
  const globalStore = useGlobalStore();

  const logListMeasurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 80,
    });
  }, []);
  const listRef = useRef<List>(null);

  const [activeKey, setActiveKey] = React.useState<string>('');
  const [autoPlay, setAutoPlay] = useState(true);

  const displayLogs = useMemo(() => {
    if (!activeKey) {
      return props.logs;
    }
    return props.logs.filter(
      (log) => log.response.sender.id === activeKey || log.response.receivers.map((r) => r.id).includes(activeKey)
    );
  }, [props.logs, activeKey]);

  const [logItemEllipsisCache, setLogItemEllipsisCache] = React.useState<Record<string, boolean>>({});

  const logItemRenderer = ({ key, index, style, parent }: any) => {
    const log = displayLogs[index];

    return (
      <CellMeasurer key={key} cache={logListMeasurerCache} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure, registerChild }) => (
          <div ref={registerChild as any} style={style}>
            <ConsoleLogItem
              log={log}
              ellipsis={logItemEllipsisCache[log.index]}
              onEllipsisChange={(newEllipsis) => {
                setLogItemEllipsisCache((prev) => {
                  return {
                    ...prev,
                    [log.index]: newEllipsis,
                  };
                });
              }}
              needMeasure={() => {
                setTimeout(() => {
                  try {
                    measure();
                  } catch {}
                }, 0);
              }}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  useEffect(() => {
    if (autoPlay) {
      setIsProgrammaticScroll(true);
      listRef.current?.scrollToRow(props.logs.length - 1);
    }
  }, [props.logs, autoPlay]);

  return (
    <Container>
      <Header>
        <div className="connectionStatus">
          <div
            className="indicator"
            style={{
              background: props.wsConnected ? theme.colorSuccess : theme.colorError,
            }}
          />
          {props.wsConnected ? <span>Connected</span> : <span>Disconnected</span>}
        </div>
        <div>
          <span>Console</span>
          <span
            style={{
              fontSize: '14px',
            }}
          >
            （{props.logs.length} Messages）
          </span>
        </div>
        <div className="actionsArea"></div>
      </Header>
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={(newActiveKey) => {
          setActiveKey(newActiveKey);
        }}
        items={[
          {
            label: 'All',
            key: '',
          },
          ...(globalStore.agentFullFilledConfigs || [])
            .filter((a) => !a.profile.role.is_static)
            .map((a) => {
              return {
                label: (
                  <Space>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: a.chart_major_color,
                      }}
                    />
                    {a.profile.name}
                  </Space>
                ),
                key: a.profile.id,
              };
            }),
        ]}
      />
      <LogsArea>
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              width={width}
              height={height}
              style={{
                padding: '12px 0',
              }}
              deferredMeasurementCache={logListMeasurerCache}
              rowCount={displayLogs.length}
              rowHeight={logListMeasurerCache.rowHeight}
              rowRenderer={logItemRenderer}
              overscanRowCount={5}
              onScroll={() => {
                if (isProgrammaticScroll) {
                  setIsProgrammaticScroll(false);
                } else {
                  setAutoPlay(false);
                }
              }}
            />
          )}
        </AutoSizer>
      </LogsArea>
    </Container>
  );
};

export default ProcessingConsole;
