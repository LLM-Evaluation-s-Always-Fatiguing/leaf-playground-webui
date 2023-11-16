'use client';

import { PropsWithChildren, memo } from 'react';
import { StyleProvider, ThemeProvider } from 'antd-style';
import { App, ConfigProvider } from 'antd';

interface GlobalLayoutProps extends PropsWithChildren {}

const GlobalLayout = ({ children }: GlobalLayoutProps) => (
  <StyleProvider>
    <ThemeProvider>
      <ConfigProvider>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeProvider>
  </StyleProvider>
);

export default GlobalLayout;
