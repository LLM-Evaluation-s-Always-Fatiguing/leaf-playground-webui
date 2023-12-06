import React from 'react';
import styled from '@emotion/styled';
import { Spin } from 'antd';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
  z-index: var(--loading-overlay-default-z-index);
`;

const SpinContent = styled.div`
  width: 180px;
`;

interface LoadingOverlayProps {
  spinning?: boolean;
  tip?: string;
  zIndex?: number;
  fullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ spinning = true, tip, zIndex, fullScreen = false }) => {
  return spinning ? (
    <Container
      style={{
        ...(zIndex !== undefined ? { zIndex } : {}),
        ...(fullScreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
            }
          : {}),
      }}
    >
      <Spin spinning={true} tip={tip}>
        <SpinContent />
      </Spin>
    </Container>
  ) : null;
};

export default LoadingOverlay;
