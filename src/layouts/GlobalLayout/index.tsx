'use client';

import { PropsWithChildren, memo } from 'react';
import { StyleProvider, ThemeProvider } from 'antd-style';
import { App, ConfigProvider } from 'antd';
import { ThemeContext } from 'styled-components';

interface GlobalLayoutProps extends PropsWithChildren {}

const GlobalLayout = ({ children }: GlobalLayoutProps) => (
  <StyleProvider>
    <ThemeProvider styled={{ ThemeContext }}>
      <ConfigProvider>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeProvider>
  </StyleProvider>
);

export default GlobalLayout;
