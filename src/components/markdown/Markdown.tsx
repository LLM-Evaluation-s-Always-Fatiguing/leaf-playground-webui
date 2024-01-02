'use client';

import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { Typography, message } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import copy from 'copy-to-clipboard';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import rehypeColorChips from 'rehype-color-chips';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';
import LocalAPI from '@/services/local';

export function copyToClipboard(text: string) {
  const result = copy(text);
  if (result) {
    message.success('Copied');
  } else {
    message.error('Copy failed');
  }
}

export function Mermaid(props: { code: string; onError: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid.mermaidAPI.initialize({
        theme: theme.appearance === 'dark' ? 'dark' : 'default',
      });
      mermaid
        .run({
          nodes: [ref.current],
        })
        .catch((e) => {
          props.onError();
          console.error('[Mermaid] ', e.message);
        });
    }
  }, [props.code, theme.appearance]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => URL.revokeObjectURL(url);
    }
  }

  return (
    <div
      key={theme.appearance}
      style={{ cursor: 'pointer', overflow: 'auto' }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}

const CustomizedPre = styled.pre`
  padding: 35px 10px 10px 10px !important;
  border-radius: 4px !important;
  overflow: hidden;
  position: relative;

  .copyCodeButton {
    position: absolute;
    right: 8px;
    top: 35px;
    cursor: pointer;
    padding: 0 5px;
    border-radius: 10px;
    transform: translateX(10px);
    pointer-events: none;
    opacity: 0;
    transition: all ease 0.3s;

    &:after {
      content: 'copy';
    }

    &:hover {
      opacity: 1;
    }
  }

  :hover .copyCodeButton {
    pointer-events: all;
    transform: translateX(0px);
    opacity: 0.5;
  }

  .codeLanguageMark {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    padding-left: 10px;
    font-size: 16px;
    line-height: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: ${(props) =>
      props.theme.isDarkMode ? props.theme.colorFillSecondary : props.theme.colorFillQuaternary};
  }
`;

export const PreCode: React.FunctionComponent<{ children: any }> = (props) => {
  const ref = useRef<HTMLPreElement>(null);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');

  useEffect(() => {
    if (!ref.current) return;
    const codeDom = ref.current.querySelector('code');
    if (codeDom) {
      codeDom.classList.forEach((codeClass) => {
        if (codeClass.startsWith('language-')) {
          const codeLang = codeClass.substring('language-'.length);
          setCodeLanguage(codeLang);
          if (codeLang === 'mermaid') {
            setMermaidCode((codeDom as HTMLElement).innerText);
          }
        }
      });
    }
  }, [props.children]);

  return (
    <>
      {mermaidCode && <Mermaid code={mermaidCode} onError={() => setMermaidCode('')} />}
      <CustomizedPre ref={ref}>
        {codeLanguage && (
          <div className={'codeLanguageMark'}>
            <div>{codeLanguage}</div>
          </div>
        )}
        <span
          className={'copyCodeButton'}
          onClick={() => {
            if (ref.current) {
              const code = ref.current.innerText;
              copyToClipboard(code);
            }
          }}
        />
        {props.children}
      </CustomizedPre>
    </>
  );
};

export const LocalImage = (
  props: {
    src?: string;
    alt?: string;
    localAssetsBasePath?: string;
  } & PropsWithChildren
) => {
  const [realSrc, setRealSrc] = useState('');
  useEffect(() => {
    const process = async () => {
      try {
        const path = await LocalAPI.path.join(props.localAssetsBasePath || '', props.src || '');
        if (path) {
          setRealSrc(`/api/file?filePath=${encodeURIComponent(path)}`);
        } else {
          setRealSrc('');
        }
      } catch (e) {
        console.log(e);
      }
    };
    process();
  }, [props.localAssetsBasePath, props.src]);
  return <img src={realSrc} alt={props.alt} />;
};

function _MarkDownContent(props: { content: string; useLocalAssets?: boolean; localAssetsBasePath?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkBreaks, remarkUnwrapImages]}
      rehypePlugins={[
        rehypeKatex,
        rehypeColorChips,
        [
          rehypeHighlight,
          {
            detect: true,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        a: (aProps: any) => {
          const href = aProps.href || '';
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? '_self' : aProps.target ?? '_blank';
          return <a {...aProps} target={target} />;
        },
        pre: PreCode as any,
        ...(props.useLocalAssets
          ? {
              img: (imgProps) => {
                return <LocalImage {...imgProps} localAssetsBasePath={props.localAssetsBasePath} />;
              },
            }
          : {}),
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

const ExtraStyleProvider = styled.div`
  .gfm-color-chip {
    margin-left: 0.125rem;
    display: inline-block;
    height: 0.625rem;
    width: 0.625rem;
    border-radius: 9999px;
    border: 1px solid gray;
  }
`;

export default function Markdown(
  props: {
    content: string;
    useLocalAssets?: boolean;
    localAssetsBasePath?: string;
    fontSize?: number | string;
  } & React.DOMAttributes<HTMLDivElement>
) {
  return (
    <Typography
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
      <ExtraStyleProvider>
        <MarkdownContent
          useLocalAssets={props.useLocalAssets}
          localAssetsBasePath={props.localAssetsBasePath}
          content={props.content}
        />
      </ExtraStyleProvider>
    </Typography>
  );
}
