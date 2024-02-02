'use client';

import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Image, Typography } from 'antd';
import { useTheme } from 'antd-style';
import styled from '@emotion/styled';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import rehypeColorChips from 'rehype-color-chips';
import rehypeFigure from 'rehype-figure';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRemoveComments from 'remark-remove-comments';
import remarkUnwrapImages from 'remark-unwrap-images';
import { copyToClipboard } from '@/utils/clipboard';

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

export const HubAssetsImage = (
  props: {
    hubAssetsProjectId?: string;
  } & PropsWithChildren &
    React.HTMLProps<HTMLImageElement> &
    Record<string, any>
) => {
  const [realSrc, setRealSrc] = useState('');
  useEffect(() => {
    const process = async () => {
      try {
        let finalFilePath = decodeURIComponent(props.src || '');
        finalFilePath = finalFilePath.replace(/\\/g, '/');
        const regex = /(static|dataset)\/.*/;
        const matches = finalFilePath.match(regex);
        finalFilePath = matches ? matches[0] : '';
        if (!finalFilePath.startsWith('/')) {
          finalFilePath = `/${finalFilePath}`;
        }
        setRealSrc(`/api/server/hub/${props.hubAssetsProjectId}${finalFilePath}`);
      } catch (e) {
        console.error(e);
      }
    };
    process();
  }, [props.src]);
  const imageProps = { ...props };
  delete imageProps.node;
  // eslint-disable-next-line @next/next/no-img-element
  return <Image width={'100%'} alt={''} {...(imageProps as any)} src={realSrc} />;
};

export const _Image = (
  props: {
    hubAssetsProjectId?: string;
  } & PropsWithChildren &
    React.HTMLProps<HTMLImageElement> &
    Record<string, any>
) => {
  const noHttpImage = !props.src?.startsWith('http');
  const imageProps = { ...props };
  delete imageProps.node;
  return noHttpImage ? (
    <HubAssetsImage {...props} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={''} {...imageProps} />
  );
};

interface MarkdownContentProps {
  content: string;
  useHubAssets?: boolean;
  hubAssetsProjectId?: string;
  removeComments?: boolean;
}

function _MarkDownContent(props: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [
          remarkMath,
          {
            singleDollarTextMath: false,
          },
        ],
        remarkBreaks,
        remarkUnwrapImages,
        ...(props.removeComments ? [remarkRemoveComments] : []),
      ]}
      rehypePlugins={[
        rehypeFigure,
        [
          rehypeRaw,
          {
            passThrough: ['eos'],
          },
        ],
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
      remarkRehypeOptions={{
        allowDangerousHtml: true,
      }}
      components={{
        a: (aProps: any) => {
          const href = aProps.href || '';
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? '_self' : aProps.target ?? '_blank';
          return <a {...aProps} target={target} />;
        },
        pre: PreCode as any,
        ...(props.useHubAssets
          ? {
              img: (imgProps) => {
                return <_Image {...imgProps} hubAssetsProjectId={props.hubAssetsProjectId} />;
              },
            }
          : {}),
        // @ts-ignore
        eos: () => {
          return '<EOS>';
        },
      }}
      urlTransform={(url, key, node) => {
        // By default, the defaultUrlTransform function in Windows environments treats local paths, such as those starting with C:/, as unsafe and replaces them with an empty string. Hence, in this case, it simply returns the URL that it has identified without any modification.
        return url;
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
    useHubAssets?: boolean;
    hubAssetsProjectId?: string;
    removeComments?: boolean;
    limitHeight?: boolean;
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
        height: props.limitHeight ? '100%' : 'auto',
      }}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
    >
      <ExtraStyleProvider
        style={{
          width: '100%',
          height: props.limitHeight ? '100%' : 'auto',
        }}
      >
        <MarkdownContent
          useHubAssets={props.useHubAssets}
          hubAssetsProjectId={props.hubAssetsProjectId}
          removeComments={props.removeComments}
          content={props.content ? processLaTeX(props.content) : props.content}
        />
      </ExtraStyleProvider>
    </Typography>
  );
}

// Regex to check if the processed content contains any potential LaTeX patterns
const containsLatexRegex = /\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$|\\begin\{equation\}.*?\\end\{equation\}/;
// Regex for inline and block LaTeX expressions
const inlineLatex = new RegExp(/\\\((.+?)\\\)/, 'g');
// const blockLatex = new RegExp(/\\\[(.*?)\\\]/, 'gs');
const blockLatex = new RegExp(/\\\[(.*?[^\\])\\\]/, 'gs');

export const processLaTeX = (content: string) => {
  // Escape dollar signs followed by a digit or space and digit
  let processedContent = content.replace(/(\$)(?=\s?\d)/g, '\\$');

  // If no LaTeX patterns are found, return the processed content
  if (!containsLatexRegex.test(processedContent)) {
    return processedContent;
  }

  // Convert LaTeX expressions to a markdown compatible format
  processedContent = processedContent
    .replace(inlineLatex, (match: string, equation: string) => `$${equation}$`) // Convert inline LaTeX
    .replace(blockLatex, (match: string, equation: string) => `$$${equation}$$`); // Convert block LaTeX

  return processedContent;
};
