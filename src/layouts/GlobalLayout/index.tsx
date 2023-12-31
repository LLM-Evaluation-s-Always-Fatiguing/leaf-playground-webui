'use client';

import { PropsWithChildren, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { App, ConfigProvider, Layout } from 'antd';
import { StyleProvider, ThemeProvider, createStyles, setupStyled, useTheme } from 'antd-style';
import { ThemeAppearance } from 'antd-style/lib/types/appearance';
import en_US from 'antd/locale/en_US';
import { setValidateLanguage } from '@formily/core';
import { HappyProvider } from '@ant-design/happy-work-theme';
import { ThemeContext } from '@emotion/react';
import merge from 'lodash/merge';
import DefaultHeader from '@/components/header/DefaultHeader';
import {
  commonCustomToken,
  commonTheme,
  darkCustomToken,
  darkTheme,
  lightCustomToken,
  lightTheme,
} from '@/layouts/GlobalLayout/theme';
import useDisplayConfig from '@/managers/DisplayConfigManager/useDisplayConfig';
import useGlobalStore from '@/stores/global';

setValidateLanguage('en-US');
setupStyled({ ThemeContext });

const { Content } = Layout;

const useStyles = createStyles(({ token, css }) => ({
  content: css`
    height: calc(100vh - ${token.headerHeight}px);
    overflow: hidden auto;
    position: relative;
  `,
}));

const GlobalLayoutContent = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  const theme = useTheme();

  useEffect(() => {
    window.document.getElementsByTagName('html')[0].setAttribute('data-theme', theme.appearance);
  }, [theme.appearance]);

  return <Content className={styles.content}>{children}</Content>;
};

interface GlobalLayoutProps extends PropsWithChildren {}

const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const displayConfig = useDisplayConfig();
  const globalStore = useGlobalStore();

  useEffect(() => {
    globalStore.clearPageTitle();
  }, [pathname, searchParams]);

  return (
    <StyleProvider speedy={true}>
      <ThemeProvider
        defaultAppearance={displayConfig.themeMode === 'auto' ? undefined : displayConfig.themeMode}
        themeMode={displayConfig.themeMode}
        customToken={({ appearance }) => {
          return {
            ...commonCustomToken,
            ...(appearance === 'light' ? lightCustomToken : darkCustomToken),
          };
        }}
        theme={(appearance: ThemeAppearance) => {
          return merge({}, commonTheme, appearance === 'light' ? lightTheme : darkTheme, {
            token: {
              colorPrimary: displayConfig.primaryColor,
            },
          });
        }}
      >
        <ConfigProvider locale={en_US}>
          <HappyProvider disabled={!displayConfig.happyWorkEffect}>
            <App>
              <Layout>
                <DefaultHeader />
                <GlobalLayoutContent>{children}</GlobalLayoutContent>
              </Layout>
            </App>
          </HappyProvider>
        </ConfigProvider>
      </ThemeProvider>
    </StyleProvider>
  );
};

export default GlobalLayout;
