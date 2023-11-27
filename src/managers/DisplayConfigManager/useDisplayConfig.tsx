import { ThemeMode } from 'antd-style/lib/types';
import React, { createContext, PropsWithChildren, useContext } from 'react';

export interface DisplayConfigContextProps {
  themeMode: ThemeMode;
  happyWorkEffect: boolean;
  primaryColor: string;

  toggleThemeMode(themeMode: ThemeMode): void;

  toggleHappyWorkEffect(): void;

  applyPrimaryColor(color: string): void;
}

const DisplayConfigContext = createContext<DisplayConfigContextProps | null>(null);

export default function useDisplayConfig() {
  const ctx = useContext(DisplayConfigContext);

  if (!ctx) {
    throw new Error(
      'useDisplayConfig hook was called outside of context, make sure your app is wrapped with DisplayConfigProvider component'
    );
  }

  return ctx;
}

interface DisplayConfigProviderProps extends DisplayConfigContextProps, PropsWithChildren {}

export function DisplayConfigProvider({
  themeMode,
  happyWorkEffect,
  primaryColor,
  toggleThemeMode,
  toggleHappyWorkEffect,
  applyPrimaryColor,
  children,
}: DisplayConfigProviderProps) {
  return (
    <DisplayConfigContext.Provider
      value={{
        themeMode,
        happyWorkEffect,
        primaryColor,
        toggleThemeMode,
        toggleHappyWorkEffect,
        applyPrimaryColor,
      }}
    >
      {children}
    </DisplayConfigContext.Provider>
  );
}
