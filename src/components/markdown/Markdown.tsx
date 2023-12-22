'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownStylesProvider from '@/components/markdown/MarkdownStylesProvider';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import 'katex/dist/katex.min.css';
import rehypeKatex from 'rehype-katex';

function _MarkDownContent(props: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
      rehypePlugins={[rehypeKatex]}
      components={{
        a: (aProps: any) => {
          const href = aProps.href || '';
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? '_self' : aProps.target ?? '_blank';
          return <a {...aProps} target={target} />;
        },
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export default function Markdown(
  props: {
    content: string;
    fontSize?: number | string;
  } & React.DOMAttributes<HTMLDivElement>
) {
  return (
    <MarkdownStylesProvider
      style={{
        fontSize: props.fontSize
          ? typeof props.fontSize === 'number'
            ? props.fontSize + 'px'
            : props.fontSize
          : '0.875rem',
        width: '100%',
        height: 'auto',
      }}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
    >
      <MarkdownContent content={props.content} />
    </MarkdownStylesProvider>
  );
}
