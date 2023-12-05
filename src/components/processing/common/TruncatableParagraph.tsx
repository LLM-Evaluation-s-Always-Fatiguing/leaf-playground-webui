import React, { useState, useEffect, useRef, PropsWithChildren } from 'react';
import styled from '@emotion/styled';
import { Button, Space } from 'antd';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
const TextArea = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`;

export enum TruncatableParagraphEllipsisStatus {
  WaitDetect = 'WaitDetect',
  NoNeedEllipsis = 'NoNeedEllipsis',
  Ellipsis = 'Ellipsis',
  Expanded = 'Expanded',
}

interface TruncatableParagraphProps extends PropsWithChildren {
  maxLine?: number;
  ellipsisStatus: TruncatableParagraphEllipsisStatus;
  onEllipsisStatusChange: (status: TruncatableParagraphEllipsisStatus) => void;
}

const TruncatableParagraph = ({
  maxLine = 3,
  ellipsisStatus,
  onEllipsisStatusChange,
  children,
}: TruncatableParagraphProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncatable, setIsTruncatable] = useState(false);

  useEffect(() => {
    if (!textRef.current) return;
    if (textRef.current.scrollHeight > textRef.current.clientHeight) {
      setIsTruncatable(true);
    }
    if (ellipsisStatus !== TruncatableParagraphEllipsisStatus.WaitDetect) return;
    onEllipsisStatusChange(
      textRef.current.scrollHeight > textRef.current.clientHeight
        ? TruncatableParagraphEllipsisStatus.Ellipsis
        : TruncatableParagraphEllipsisStatus.NoNeedEllipsis
    );
  }, [children, ellipsisStatus]);

  const renderToggleMoreButton = () =>
    ellipsisStatus === TruncatableParagraphEllipsisStatus.Ellipsis ? (
      <Button
        size={'small'}
        type="link"
        style={{
          alignSelf: 'flex-end',
        }}
        onClick={() => {
          onEllipsisStatusChange(TruncatableParagraphEllipsisStatus.Expanded);
        }}
      >
        <Space align={'center'}>
          Read More
          <IoIosArrowDown
            size={'1.2em'}
            style={{
              position: 'relative',
              top: '4px',
            }}
          />
        </Space>
      </Button>
    ) : (
      <Button
        size={'small'}
        type="link"
        style={{
          alignSelf: 'flex-end',
        }}
        onClick={() => {
          onEllipsisStatusChange(TruncatableParagraphEllipsisStatus.Ellipsis);
        }}
      >
        <Space align={'center'}>
          Put Away
          <IoIosArrowUp
            size={'1.2em'}
            style={{
              position: 'relative',
              top: '4px',
            }}
          />
        </Space>
      </Button>
    );

  return (
    <Container>
      <TextArea
        style={
          ellipsisStatus === TruncatableParagraphEllipsisStatus.Ellipsis ||
          ellipsisStatus === TruncatableParagraphEllipsisStatus.WaitDetect
            ? {
                WebkitLineClamp: maxLine,
              }
            : {}
        }
        ref={textRef}
      >
        {children}
      </TextArea>
      {isTruncatable && renderToggleMoreButton()}
    </Container>
  );
};

export default TruncatableParagraph;
