import { getCookie } from 'cookies-next';
import {
  HAPPY_WORK_EFFECT_COOKIE_NAME,
  PRIMARY_COLOR_COOKIE_NAME,
  THEME_MODE_COOKIE_NAME,
} from '@/managers/DisplayConfigManager/def';
import { cookies } from 'next/headers';
import { ThemeMode } from 'antd-style';
import { commonTheme } from '@/layouts/GlobalLayout/theme';

export function getDisplayConfigPersistentStateFromCookies() {
  const themeMode = (getCookie(THEME_MODE_COOKIE_NAME, { cookies }) || 'light') as ThemeMode;
  const happyWorkEffect = getCookie(HAPPY_WORK_EFFECT_COOKIE_NAME, { cookies }) === 'true';
  const primaryColor = getCookie(PRIMARY_COLOR_COOKIE_NAME, { cookies }) || (commonTheme.token!.colorPrimary as string);
  return {
    themeMode,
    happyWorkEffect,
    primaryColor,
  };
}
