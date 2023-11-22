import { Button, Layout } from 'antd';
import styled from '@emotion/styled';
import LEAFLogo from '@/components/project/LEAFLogo';
import { ThemeMode, useTheme, useThemeMode } from 'antd-style';
import { MdOutlineBrightnessAuto, MdOutlineLightMode, MdOutlineDarkMode, MdOutlineSettings } from 'react-icons/md';
import { TbBrandGithub } from 'react-icons/tb';

const { Header } = Layout;

const HeaderLogoArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .title {
    margin-left: 12px;
    font-size: 21px;
  }
`;

const HeaderActionsArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  .actionButton {
    font-size: 21px;
    line-height: 1;
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
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <Header
      style={{
        height: theme.headerHeight,
        borderBottom: `1.5px solid ${theme.dividerColor}`,
      }}
    >
      <DefaultHeaderContent>
        <HeaderLogoArea>
          <LEAFLogo />
          <div className="title">Playground</div>
        </HeaderLogoArea>
        <HeaderActionsArea>
          <Button
            className="actionButton"
            type="text"
            icon={<TbBrandGithub size={'1em'} />}
            onClick={() => {
              window.open('https://github.com/LLM-Evaluation-s-Always-Fatiguing/leaf-playground', '_blank');
            }}
          />
          <Button
            className="actionButton"
            type="text"
            style={
              themeMode !== 'auto'
                ? {
                    color: theme.colorTextDisabled,
                  }
                : {}
            }
            icon={<MdOutlineBrightnessAuto size={'1em'} />}
            onClick={() => {
              setThemeMode(themeMode === 'auto' ? (theme.appearance as ThemeMode) : 'auto');
            }}
          />
          <Button
            className="actionButton"
            type="text"
            disabled={themeMode === 'auto'}
            icon={
              theme.appearance === 'dark' ? <MdOutlineLightMode size={'1em'} /> : <MdOutlineDarkMode size={'1em'} />
            }
            onClick={() => {
              setThemeMode(theme.appearance === 'dark' ? 'light' : 'dark');
            }}
          />
          <Button className="actionButton" type="text" icon={<MdOutlineSettings size={'1em'} />} />
        </HeaderActionsArea>
      </DefaultHeaderContent>
    </Header>
  );
};

export default DefaultHeader;
