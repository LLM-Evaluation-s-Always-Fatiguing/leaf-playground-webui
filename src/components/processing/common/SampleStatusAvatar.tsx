import styled from '@emotion/styled';
import React from 'react';
import SampleAvatar, { SampleAvatarProps } from '@/components/processing/common/SampleAvatar';
import { FaCheckCircle } from 'react-icons/fa';
import { useTheme } from 'antd-style';

const Container = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;

  .doneMark {
    position: absolute;
    top: 0;
    right: 0;
    width: 12px;
    height: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: ${(props) => props.theme.colorSuccess};
    z-index: 5;
  }

  .thinkingMark {
    position: absolute;
    top: 0;
    right: -4px;
    width: 16px;
    height: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: ${(props) => props.theme.colorSuccess};
    z-index: 5;
  }
`;

const DotAnimation = styled.div<{
  color: string;
}>`
  width: 100%;
  aspect-ratio: 4;
  --_g: no-repeat radial-gradient(circle closest-side, ${(props) => props.color} 90%, ${(props) => props.color}00);
  background:
    var(--_g) 0 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 100%;
  animation: d7 1s infinite linear;

  @keyframes d7 {
    33% {
      background-size:
        calc(100% / 3) 0,
        calc(100% / 3) 100%,
        calc(100% / 3) 100%;
    }
    50% {
      background-size:
        calc(100% / 3) 100%,
        calc(100% / 3) 0,
        calc(100% / 3) 100%;
    }
    66% {
      background-size:
        calc(100% / 3) 100%,
        calc(100% / 3) 100%,
        calc(100% / 3) 0;
    }
  }
`;

interface SampleStatusAvatarProps extends SampleAvatarProps {
  status: 'silence' | 'speaking' | 'done';
}

const SampleStatusAvatar = ({ status, ...restProps }: SampleStatusAvatarProps) => {
  const theme = useTheme();

  return (
    <Container>
      <SampleAvatar {...restProps} />
      {status === 'done' && (
        <div className="doneMark">
          <FaCheckCircle size={'1em'} />
        </div>
      )}
      {status === 'speaking' && (
        <div className="thinkingMark">
          <DotAnimation color={restProps.style?.color || theme.colorPrimary} />
        </div>
      )}
    </Container>
  );
};

export default SampleStatusAvatar;
