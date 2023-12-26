import React, { PropsWithChildren } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 21px;
  background: ${(props) => props.theme.colorFillSecondary};
  color: ${(props) => props.theme.colorPrimary};
`;

export interface SampleAvatarProps extends PropsWithChildren {
  style?: React.CSSProperties;
}

const SampleAvatar = (props: SampleAvatarProps) => {
  return <Container style={props.style}>{props.children}</Container>;
};

export default SampleAvatar;
