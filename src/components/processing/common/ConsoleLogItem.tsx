import styled from '@emotion/styled';
import SceneLog, {
  SceneLogJSONContent,
  SceneLogMediaType,
  SceneLogMessage,
  SceneLogTextContent,
} from '@/types/server/Log';
import React, { useEffect } from 'react';
import { Button, Space } from 'antd';
import { TbCodeDots } from 'react-icons/tb';
import TruncatableParagraph, {
  TruncatableParagraphEllipsisStatus,
} from '@/components/processing/common/TruncatableParagraph';

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

function getSceneLogMessageDisplayContent(message: SceneLogMessage) {
  switch (message.content.type) {
    case SceneLogMediaType.TEXT: {
      const content = message.content as SceneLogTextContent;
      return content.display_text || content.text;
    }
    case SceneLogMediaType.AUDIO:
      return 'Audio';
    case SceneLogMediaType.IMAGE:
      return 'Image';
    case SceneLogMediaType.VIDEO:
      return 'Video';
    case SceneLogMediaType.JSON: {
      const content = message.content as SceneLogJSONContent;
      return content.display_text || JSON.stringify(content.data, null, 2);
    }
    default:
      return message.content.display_text || 'Log Type Unknown';
  }
}

interface ConsoleLogItemProps {
  log: SceneLog;
  ellipsisStatus: TruncatableParagraphEllipsisStatus;
  onEllipsisStatusChange: (status: TruncatableParagraphEllipsisStatus) => void;
  needMeasure: () => void;
  onOpenJSONDetail: (log: SceneLog) => void;
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
        {log.narrator}
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
