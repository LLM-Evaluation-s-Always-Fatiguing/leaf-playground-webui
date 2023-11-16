'use client';

import { PropsWithChildren, useRef, useState } from 'react';
import { StyleProvider, extractStaticStyle } from 'antd-style';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { useServerInsertedHTML } from 'next/navigation';

const StyleRegistry = ({ children }: PropsWithChildren) => {
  const isInsert = useRef(false);
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    // Avoid repeatedly inserting styles when rendering multiple times.
    // refs: https://github.com/vercel/next.js/discussions/49354#discussioncomment-6279917
    if (isInsert.current) return;

    isInsert.current = true;

    const antdStyles = extractStaticStyle().map((item) => item.style);
    const scStyles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();

    return (
      <>
        {antdStyles}
        {scStyles}
      </>
    );
  });

  return (
    <StyleProvider cache={extractStaticStyle.cache}>
      <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>
    </StyleProvider>
  );
};

export default StyleRegistry;
