'use client';

import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import styled from '@emotion/styled';
import { MdPerson3 } from "react-icons/md";
import { useEffect, useRef } from 'react';
import { SceneLogTextContent } from '@/types/server/Log';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow: hidden scroll;
  padding: 16px 12px;

  border-right: 1px solid ${(props) => props.theme.dividerColor};

  .examiner {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 21px;
      background: ${(props) => props.theme.colorFillSecondary};
      color: ${(props) => props.theme.colorPrimary};
    }

    .card {
      margin-left: 8px;
      max-width: calc(100% - 88px);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .header {
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
        display: flex;
        flex-direction: column;
        white-space: pre-line;
        padding: 16px 12px;
      }
    }
  }

  .examinee {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    align-items: flex-start;

    .avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 21px;
      background: ${(props) => props.theme.colorFillSecondary};
      color: ${(props) => props.theme.colorPrimary};
    }

    .card {
      margin-right: 8px;
      max-width: calc(100% - 88px);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;

      .header {
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0 12px;
        border-radius: 6px 6px 0 0;
        background: ${(props) => props.theme.colorFillContent};
      }

      .body {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        white-space: pre-line;
        padding: 16px 12px;
        word-break: break-all;
      }
    }
  }

  .examiner + .examinee {
    margin-top: 12px;
  }

  .examinee + .examinee {
    margin-top: 12px;
  }

  .examinee + .examiner {
    margin-top: 12px;
  }
`;

interface BuddhaVisualizationProps extends DefaultProcessingVisualizationComponentProps {}

const BuddhaVisualization = (props: BuddhaVisualizationProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const enableAutoScrollToBottomRef = useRef(true);
  const reEnableAutoScrollToBottomTimerRef = useRef<any>();

  useEffect(() => {
    if (!enableAutoScrollToBottomRef.current) return;
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current?.scrollHeight || 0,
      behavior: 'smooth',
    });
  }, [props.logs]);

  return (
    <Container
      ref={scrollAreaRef}
      onWheel={() => {
        if (reEnableAutoScrollToBottomTimerRef.current) {
          clearTimeout(reEnableAutoScrollToBottomTimerRef.current);
        }
        enableAutoScrollToBottomRef.current = false;
        reEnableAutoScrollToBottomTimerRef.current = setTimeout(() => {
          enableAutoScrollToBottomRef.current = true;
          reEnableAutoScrollToBottomTimerRef.current = undefined;
        }, 1000);
      }}
    >
      {props.logs.map((log, index) => {
        return (
          <div key={index} className={log.references ? 'examinee' : 'examiner'}>
            <div className="avatar">
              {log.references ? (
                <img
                  style={{
                    width: '1em',
                    height: '1em',
                  }}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADqUlEQVR4nM2aWaiNURTHf8Zr5oab6XpQrojMQ5mVMpSpKOQFJV48KSSueCEeJXO8mCnCCyEkXmRIuIZrCMl8zde9n5bWrdNu73PO/r597jn/WnX6zt7/tdY+a6+99voOhMcUYB/wFPgKVAMVwAFgIgWMMuA6EGWQizq2oDAW+JyF8XXyARhFgaAn8NHD+FQnelAAuGAx7iwwEigCmgAjgJOOcMorxluMks3awDF+k2X8BPKInYYx34CSNOMbAzeMOTvII+4YxhzPYs48Y8598ogqw5hzwFaN7Sf6i0S6yd8Al9TJ1Dlf8ulAnOxjyo98GT8X+BnAgQg4X5+HW7GmySiwVAEzcm18N+BRGiMeaaqcBvRXZ9G02hkYB6wGbjrm1wDzc2V8sWYMU+lfYDvQz5NPHDxn4fsDjMmFA4csyh4AAxLybrHwPgNaExBTHeHSJRD/dgt/OQFxyxI2QwLytwJeGDo+6fPEGGpZnW2ExyKLnjkhiM0CrBZYAVzRVXoHXAOWa/WZCc10rMx5p4ehcC0AvlsKw8S4ZAmfWkcavK2p1oVS4K5jbq2eyiZfYrz1PJDEwPYWng7APU+uLyEciFMuPASmAy1Upmc4ACOH/A7hQI2D/KDW/rKyp2MYdwxoqxyHHWMkXBPjl4O8Y8qYpp5OnNI5dSjJ5S/w3EFuQjLQZu0DuQyv1qxmy1aRRd6HcOBqlg7UoRewUQu21ypyjdyg37kQWUQO0MTY5elAXEQWOZGUdFaaLBQakUVk/82MS9hJ87ArnkMjcoj0V7vGISzPkElCI0oja+MQXjFIVgLNPUvwV8BLYLLHvObAKkP35Rj2/88eqSRSlfrgZcpcKZV9MNzQLQvhjd8GieyJ+nKgs6FbEok3zAOpnef8yeqEGD8pxv07SnoimzWQT/wnRQvLCe4NMxM0ov7QyHJX8IZ5aZHOcn2hiaFboiHxHmijz1tqG1BeEc0GGiZc6dnKVabcaJlt9oq8YZYQpboPzNAalsCBERY+0dE9RAO4wiBZAvS1KJSXHHGxx8LXV3WlPpPbnDf2ZjjeU1PcwBj8gzU0stGxmxwreOxZcHXTFyBRFiI2DCImlmW4YZn9zNFZvlOuzJKzGlhKQgzVBlOlbia55h0B1lsU1ujdeI6ucpFKqT474+gplQNHlfuH6tofo/7yxrosVzKdrCHPWByzdyQrvZACQS8NHVfLMVVqta0if1EoOPTRvSEXEGlJSooVkc/yTGK9d0iN/wCp8MgWvwcy9gAAAABJRU5ErkJggg=="
                  alt={'avatar'}
                />
              ) : (
                <MdPerson3 size={'1em'} />
              )}
            </div>
            <div className="card">
              <div className="header">{log.narrator}</div>
              <div className="body">{(log.response.content as SceneLogTextContent).text}</div>
            </div>
          </div>
        );
      })}
    </Container>
  );
};

export default BuddhaVisualization;
