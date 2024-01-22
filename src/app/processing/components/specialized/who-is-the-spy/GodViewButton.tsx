import React, { useState } from 'react';
import styled from '@emotion/styled';
import { EyeCloseIcon } from '@/app/processing/components/specialized/who-is-the-spy/icons/EyeCloseIcon';
import { EyeOpenIcon } from '@/app/processing/components/specialized/who-is-the-spy/icons/EyeOpenIcon';

const Container = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 21px;
`;

interface GodViewButtonProps {
  godView: boolean;
  onGodViewChange: (godView: boolean) => void;
}

const GodViewButton = (props: GodViewButtonProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Container
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onClick={() => {
        props.onGodViewChange(!props.godView);
      }}
    >
      {(hovered ? !props.godView : props.godView) ? <EyeOpenIcon /> : <EyeCloseIcon />}
    </Container>
  );
};

export default GodViewButton;
