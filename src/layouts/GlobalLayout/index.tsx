'use client';

import { PropsWithChildren } from 'react';
import { createStyles, setupStyled, StyleProvider, ThemeProvider } from 'antd-style';
import { App, ConfigProvider, Layout } from 'antd';
import { ThemeContext } from '@emotion/react';
import { ThemeAppearance } from 'antd-style/lib/types/appearance';
import {
  commonTheme,
  lightTheme,
  darkTheme,
  commonCustomToken,
  lightCustomToken,
  darkCustomToken,
} from '@/layouts/GlobalLayout/theme';
import DefaultHeader from '@/components/header/DefaultHeader';
import merge from 'lodash/merge';

setupStyled({ ThemeContext });

const { Content } = Layout;

const useStyles = createStyles(({ token, css }) => ({
  content: css`
    height: calc(100vh - ${token.headerHeight}px);
    overflow: hidden auto;
  `,
}));

const GlobalLayoutContent = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  return <Content className={styles.content}>{children}</Content>;
};

interface GlobalLayoutProps extends PropsWithChildren {}

const GlobalLayout = ({ children }: GlobalLayoutProps) => (
  <StyleProvider speedy={true}>
    <ThemeProvider
      customToken={({ appearance }) => {
        return {
          ...commonCustomToken,
          ...(appearance === 'light' ? lightCustomToken : darkCustomToken),
        };
      }}
      theme={(appearance: ThemeAppearance) => {
        return merge({}, commonTheme, appearance === 'light' ? lightTheme : darkTheme);
      }}
    >
      <ConfigProvider>
        <App>
          <Layout>
            <DefaultHeader />
            <GlobalLayoutContent>{children}</GlobalLayoutContent>
          </Layout>
        </App>
      </ConfigProvider>
    </ThemeProvider>
  </StyleProvider>
);

export default GlobalLayout;