'use client';

import { StyleProvider, extractStaticStyle } from 'antd-style';
import { useServerInsertedHTML } from 'next/navigation';
import { PropsWithChildren, useRef } from 'react';

const StyleRegistry = ({ children }: PropsWithChildren) => {
  const isInsert = useRef(false);

  useServerInsertedHTML(() => {
    // Avoid repeatedly inserting styles when rendering multiple times.
    // refs: https://github.com/vercel/next.js/discussions/49354#discussioncomment-6279917
    if (isInsert.current) return;

    isInsert.current = true;

    const styles = extractStaticStyle().map((item) => item.style);

    return <>{styles}</>;
  });

  return <StyleProvider cache={extractStaticStyle.cache}>{children}</StyleProvider>;
};

export default StyleRegistry;
