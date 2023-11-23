'use client';

import { PropsWithChildren, useRef } from 'react';
import { StyleProvider, extractStaticStyle } from 'antd-style';
import { useServerInsertedHTML } from 'next/navigation';
import NextAppDirEmotionCacheProvider from '@/components/core/EmotionCache';

const StyleRegistry = ({ children }: PropsWithChildren) => {
  const isServerInserted = useRef<boolean>(false);

  useServerInsertedHTML(() => {
    // Avoid repeatedly inserting styles when rendering multiple times.
    // refs: https://github.com/vercel/next.js/discussions/49354#discussioncomment-6279917
    if (isServerInserted.current) return;
    isServerInserted.current = true;
    const styles = extractStaticStyle().map((item) => item.style);
    return <>{styles}</>;
  });

  return (
    <StyleProvider cache={extractStaticStyle.cache}>
      <NextAppDirEmotionCacheProvider
        options={{
          key: 'leaf',
        }}
      >
        {children}
      </NextAppDirEmotionCacheProvider>
    </StyleProvider>
  );
};

export default StyleRegistry;
