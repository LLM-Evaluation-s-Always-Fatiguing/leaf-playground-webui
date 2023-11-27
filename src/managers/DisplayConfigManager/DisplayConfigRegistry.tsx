'use client';

import { PropsWithChildren, useState } from 'react';
import { DisplayConfigContextProps, DisplayConfigProvider } from '@/managers/DisplayConfigManager/useDisplayConfig';
import { setCookie } from 'cookies-next';
import {
  HAPPY_WORK_EFFECT_COOKIE_NAME,
  PRIMARY_COLOR_COOKIE_NAME,
  THEME_MODE_COOKIE_NAME,
} from '@/managers/DisplayConfigManager/def';
import { OptionsType } from 'cookies-next/lib/types';
import dayjs from 'dayjs';

const cookieOptions: OptionsType = {
  expires: dayjs().add(1, 'year').toDate(),
};

interface DisplayConfigRegistryProps
  extends PropsWithChildren,
    Pick<DisplayConfigContextProps, 'themeMode' | 'happyWorkEffect' | 'primaryColor'> {}

const DisplayConfigRegistry = (props: DisplayConfigRegistryProps) => {
  const [themeMode, setThemeMode] = useState(props.themeMode);
  const [happyWorkEffect, setHappyWorkEffect] = useState(props.happyWorkEffect);
  const [primaryColor, setPrimaryColor] = useState(props.primaryColor);

  return (
    <DisplayConfigProvider
      themeMode={themeMode}
      happyWorkEffect={happyWorkEffect}
      primaryColor={primaryColor}
      toggleThemeMode={(themeMode) => {
        setThemeMode(themeMode);
        setCookie(THEME_MODE_COOKIE_NAME, themeMode, cookieOptions);
      }}
      toggleHappyWorkEffect={() => {
        setHappyWorkEffect(!happyWorkEffect);
        setCookie(HAPPY_WORK_EFFECT_COOKIE_NAME, happyWorkEffect, cookieOptions);
      }}
      applyPrimaryColor={(primaryColor) => {
        setPrimaryColor(primaryColor);
        setCookie(PRIMARY_COLOR_COOKIE_NAME, primaryColor, cookieOptions);
      }}
    >
      {props.children}
    </DisplayConfigProvider>
  );
};

export default DisplayConfigRegistry;
