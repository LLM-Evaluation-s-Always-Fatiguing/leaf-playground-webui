'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Layout, Tooltip } from 'antd';
import { ThemeMode, useTheme } from 'antd-style';
import styled from '@emotion/styled';
import { FaRegAngry, FaRegLaughSquint } from 'react-icons/fa';
import { MdOutlineBrightnessAuto, MdOutlineDarkMode, MdOutlineInfo, MdOutlineLightMode } from 'react-icons/md';
import { TbBrandGithub } from 'react-icons/tb';
import AboutModal from '@/components/common/AboutModal';
import HeaderPrimaryColorPicker from '@/components/header/PrimaryColorPicker';
import LEAFLogo from '@/components/project/LEAFLogo';
import useDisplayConfig from '@/managers/DisplayConfigManager/useDisplayConfig';
import useGlobalStore from '@/stores/global';

const { Header } = Layout;

const HeaderLogoArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  user-select: none;
  flex-grow: 1;
  flex-basis: 1px;

  .title {
    margin-left: 12px;
    font-size: 21px;
  }
`;

const HeaderTitleArea = styled.div`
  font-size: 24px;
  font-weight: 600;
  user-select: none;
  flex-grow: 1;
  flex-basis: 1px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const HeaderActionsArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;
  flex-basis: 1px;

  .actionButton {
    font-size: 21px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .actionButton + .actionButton {
    margin-left: 6px;
  }
`;

const DefaultHeaderContent = styled.div`
  width: 100%;
  padding: 0 16px 0 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DefaultHeader = () => {
  const theme = useTheme();
  const router = useRouter();

  const displayConfig = useDisplayConfig();
  const globalStore = useGlobalStore();

  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  return (
    <>
      <Header
        style={{
          height: theme.headerHeight,
          borderBottom: `1.5px solid ${theme.dividerColor}`,
        }}
      >
        <DefaultHeaderContent>
          <HeaderLogoArea
            onClick={() => {
              router.push('/');
            }}
          >
            <LEAFLogo />
            <div className="title">Playground</div>
          </HeaderLogoArea>
          {globalStore.pageTitle && <HeaderTitleArea>{globalStore.pageTitle}</HeaderTitleArea>}
          <HeaderActionsArea>
            <Tooltip title={'Github'}>
              <Button
                className="actionButton"
                type="text"
                icon={<TbBrandGithub size={'1em'} />}
                onClick={() => {
                  window.open('https://github.com/LLM-Evaluation-s-Always-Fatiguing/leaf-playground', '_blank');
                }}
              />
            </Tooltip>
            <HeaderPrimaryColorPicker />
            <Tooltip title={displayConfig.happyWorkEffect ? 'Disable Happy Work Effect' : 'Enable Happy Work Effect'}>
              <Button
                className="actionButton"
                type="text"
                icon={
                  displayConfig.happyWorkEffect ? <FaRegAngry size={'0.95em'} /> : <FaRegLaughSquint size={'0.95em'} />
                }
                onClick={() => {
                  displayConfig.toggleHappyWorkEffect();
                }}
              />
            </Tooltip>
            <Tooltip title={'Auto Theme'}>
              <Button
                className="actionButton"
                type="text"
                style={
                  theme.themeMode !== 'auto'
                    ? {
                        color: theme.colorTextDisabled,
                      }
                    : {}
                }
                icon={<MdOutlineBrightnessAuto size={'1em'} />}
                onClick={() => {
                  displayConfig.toggleThemeMode(theme.themeMode === 'auto' ? (theme.appearance as ThemeMode) : 'auto');
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                theme.themeMode === 'auto' ? undefined : theme.appearance === 'dark' ? 'Light Theme' : 'Dark Theme'
              }
            >
              <Button
                className="actionButton"
                type="text"
                disabled={theme.themeMode === 'auto'}
                icon={
                  theme.appearance === 'dark' ? <MdOutlineLightMode size={'1em'} /> : <MdOutlineDarkMode size={'1em'} />
                }
                onClick={() => {
                  displayConfig.toggleThemeMode(theme.appearance === 'dark' ? 'light' : 'dark');
                }}
              />
            </Tooltip>
            <Tooltip title={'About'}>
              <Button
                className="actionButton"
                type="text"
                icon={<MdOutlineInfo size={'1.1em'} />}
                onClick={() => {
                  setAboutModalOpen(true);
                }}
              />
            </Tooltip>
          </HeaderActionsArea>
        </DefaultHeaderContent>
      </Header>
      <AboutModal
        open={aboutModalOpen}
        onNeedClose={() => {
          setAboutModalOpen(false);
        }}
      />
    </>
  );
};

export default DefaultHeader;
