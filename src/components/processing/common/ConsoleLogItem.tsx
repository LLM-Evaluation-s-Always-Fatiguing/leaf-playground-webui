import styled from '@emotion/styled';
import { SceneActionLog } from "@/types/server/Log";
import React, { useEffect } from 'react';
import { Button } from 'antd';
import { TbCodeDots } from 'react-icons/tb';
import TruncatableParagraph, {
  TruncatableParagraphEllipsisStatus,
} from '@/components/processing/common/TruncatableParagraph';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';

const Container = styled.div`
  margin: 9px 16px;
  padding: 0 16px 12px 16px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
  border-radius: ${(props) => props.theme.borderRadius}px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  color: ${(props) => props.theme.colorTextTertiary};
  font-weight: 500;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;
`;

interface ConsoleLogItemProps {
  log: SceneActionLog;
  ellipsisStatus: TruncatableParagraphEllipsisStatus;
  onEllipsisStatusChange: (status: TruncatableParagraphEllipsisStatus) => void;
  needMeasure: () => void;
  onOpenJSONDetail: (log: SceneActionLog) => void;
}

const ConsoleLogItem = ({
  log,
  ellipsisStatus,
  onEllipsisStatusChange,
  needMeasure,
  onOpenJSONDetail,
}: ConsoleLogItemProps) => {
  useEffect(() => {
    needMeasure();
  }, [log, ellipsisStatus]);

  return (
    <Container>
      <Header>
        <div>{log.log_msg}</div>
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
          icon={<TbCodeDots size={'1em'} />}
          onClick={() => {
            onOpenJSONDetail(log);
          }}
        />
      </Header>
      <Body>
        <TruncatableParagraph
          maxLine={3}
          ellipsisStatus={ellipsisStatus}
          onEllipsisStatusChange={(newStatus) => {
            onEllipsisStatusChange(newStatus);
            needMeasure();
          }}
        >
          <strong>
            {`${log.response.sender.name} --> [${log.response.receivers.map((r) => r.name).join(', ')}]: `}
          </strong>
          {getSceneLogMessageDisplayContent(log.response)}
        </TruncatableParagraph>
      </Body>
    </Container>
  );
};

export default ConsoleLogItem;
