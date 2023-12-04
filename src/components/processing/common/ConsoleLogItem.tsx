import styled from '@emotion/styled';
import SceneLog from '@/types/server/Log';
import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

const Container = styled.div`
  margin: 0 16px 18px 16px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
  border-radius: ${(props) => props.theme.borderRadius}px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  color: ${(props) => props.theme.colorTextTertiary};
  font-weight: 500;
`;

interface ConsoleLogItemProps {
  log: SceneLog;
  ellipsis?: boolean;
  onEllipsisChange: (ellipsis: boolean) => void;
  needMeasure: () => void;
}

const ConsoleLogItem = ({ log, ellipsis, onEllipsisChange, needMeasure }: ConsoleLogItemProps) => {
  useEffect(() => {
    needMeasure();
  }, [log, ellipsis]);

  return (
    <Container>
      <Header>{log.narrator}</Header>
      <div className="body">
        <Paragraph
          ellipsis={
            ellipsis === undefined || ellipsis
              ? {
                  rows: 3,
                  expandable: true,
                  symbol: 'Read More',
                  onExpand: () => {
                    onEllipsisChange(false);
                  },
                  onEllipsis: () => {
                    onEllipsisChange(true);
                    needMeasure();
                  },
                }
              : false
          }
        >
          <strong>
            {`${log.response.sender.name} --> [${log.response.receivers.map((r) => r.name).join(', ')}]: `}
          </strong>
          {(log.response.content as any).text}
        </Paragraph>
      </div>
    </Container>
  );
};

export default ConsoleLogItem;
