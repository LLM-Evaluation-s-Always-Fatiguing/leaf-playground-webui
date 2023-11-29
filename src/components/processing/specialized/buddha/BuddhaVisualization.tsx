'use client';

import { DefaultProcessingVisualizationComponentProps } from '@/components/processing/def';
import styled from '@emotion/styled';
import { MdPerson3 } from 'react-icons/md';
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
                <svg height="1em" viewBox="0 0 602 730" xmlns="http://www.w3.org/2000/svg">
                  <g fill="currentColor">
                    <path d="m216.659587 24.7802738c23.2-14.57 50.12-23.59999998 77.55-24.67999998 25.72-.85 51.96 3.66 75.09 15.20999998 30.49 14.62 55.33 39.68 71.77 69.03 10.07 18.3300002 16.72 38.6100002 18.9 59.4300002 2.39 20.9-.11 42.02-4.24 62.54 9.23 3.03 18.49 6.91 25.44 13.93 8.96 7.98 14.88 19.07 16.99 30.85 1.84 9.77-.17 19.73-2.69 29.19-3.47 13.64-11.46 26.01-22.27 35-9.67 8.48-22.45 13.49-35.3 13.86-2.07 9.95-5.92 19.43-10.56 28.44-3.98 7.43-8.04 14.9-13.57 21.32-3.6 4.68-8.06 8.59-11.81 13.14 9.05 4.17 16.73 10.66 24.06 17.3 13.32 12.54 21.59 29.78 24.54 47.72 28.96 11.67 57.94 24.13 83.68 42.04 24.64 17.05 44.82 40.79 56.7 68.39 5.86 12.82 9.59 26.69 10.62 40.76-.09 35.01-.07 70.02-.15 105.03.54 8-6.43 15.33-14.27 16.03-8.36.79-16.25-6.56-15.92-14.97.23-29.03.16-58.06.31-87.09-.14-9.72.48-19.56-1.74-29.11-2.33-14.58-9.58-27.74-17.74-39.82-9.57-13.92-22.64-24.98-36.25-34.79-21.63-15.4-46.01-26.32-70.64-35.94-5.38 18.31-14.16 35.46-23.72 51.91-17.79 28.39-39.98 53.81-63.81 77.27-40.48 40.18-87.08 73.77-136.07 102.78-7.21 3.88-14.28 8.53-22.41 10.19-10.51 1.76-20.76-9.91-16.54-20.04 2.01-5.8 8.14-8 12.98-10.85 32.65-17.62 63.38-38.66 92.5-61.61 16.19-12.68 31.92-25.98 46.55-40.46 23.49-23.78 46.32-48.69 63.5-77.53 6.24-10.68 11.38-21.98 15.67-33.57 3.59-10.43 7.41-21.48 5.43-32.65-1.28-8.08-6.48-14.73-11.64-20.78-3.86 16.32-12.75 30.77-21.93 44.58-20.18 29.56-45.35 55.35-71.95 79.16-29.39 26.99-60.86 51.68-93.87 74.08-36.24 24.25-74.9 44.84-114.95 62.04.05 7.4-.03 14.79-.04 22.18-.11 8.06-7.5099997 15.38-15.6699997 14.84-5.53.3-10.6-3.3-12.85-8.21-1.99-3.57-1.79-7.75-1.69-11.68.03-30.31.21-60.61.07-90.91-.2-7.04 5.54-13.08 12.14-14.66 9-1.73 18.3699997 6.3 17.9999997 15.47-.01 12.92-.01 25.84.13 38.77 9.43-3.44 18.22-8.34 27.36-12.42 17.69-9.05 35.34-18.23 52.1-28.94 10.68-6.37 20.9-13.47 31.39-20.12-11.14-14.13-21.26-29.05-30.47-44.5-4.97-8.14-9.77-16.41-13.62-25.14-5.73-12.77-11.61-25.57-15.27-39.12-15.16 5.38-29.48 12.79-43.68 20.26-17.4799997 9.54-34.3199997 20.54-48.7299997 34.37-15.91 16.27-28.56 36.59-32.68 59.21-1.39 7.86-.9 15.85-.98 23.79.03 27.99-.04 55.99 0 83.98-.09 3.5.46 7.18-.9 10.53-2.92 8.28-14.03 12.46-21.57999996 7.84-4.48-2.9-7.91-7.86-7.92-13.33-.02-35.05-.00965745-70.11.04-105.16.88-19.61 8.59-38.12 17.71999996-55.22 8.61-14.27 19-27.53 31.31-38.79 13.97-13.61 30.65-23.97 47.69-33.26 9.3299997-4.76 18.5199997-9.82 28.1499997-13.96 9.08-4.07 18.55-7.21 27.64-11.25.88-16.97 9.23-32.93 21.06-44.89 7.89-8 16.84-15.33 27.26-19.73-11.87-12.11-22.51-25.73-29.26-41.4-3.24-7.09-6.03-14.39-7.88-21.97-11.4.72-22.28-4.28-31.55-10.47-15.86-11.63-25.79-30.44-28.06-49.82-1.47-11.22-.34-23.05 4.93-33.2 7.18-14.49 20.96-25.55 36.75-29.2-1.31-11.29-3.91-22.42-4.25-33.81-.6-16.04.35-32.24 4-47.9 5.46-20.89 14.22-41.1100002 27.29-58.4000002 11.97-16.17 26.81-30.31 43.81-41.11m35.65 14.82c-23.82 10.17-44.39 27.46-59.17 48.68-4.9 7.74-9.3 15.8400002-12.55 24.4200002-9.13 21.99-10.9 46.59-7.18 69.98 2.54 13.37 6.12 26.57 10.84 39.34 1.74 4.92 3.75 9.92 3.69 15.23.04 17.97.16 35.95.04 53.93-.08 3.89.66 7.72 1.42 11.51 2.32 11.3 4.33 22.79 8.93 33.44 7.13 18.34 21.13 33.15 36.61 44.85-.55-7.55-1.82-15.26.04-22.73 3.12-13.98 13.68-25.81 26.87-31.16 7.05-2.9 14.82-3.11 22.34-3 13.02.04 26.03-.09 39.05.08 19.29.72 37.9 14.19 43.12 33.03 2.4 7.78 1.56 15.99 1.18 23.98 16.07-11.53 29.15-27.46 36.73-45.78 4.47-10.59 5.32-22.17 8.23-33.19.84-3.62 2.03-7.22 1.97-10.97.01-17.67.03-35.34-.08-53.01-.16-9.44 4.53-17.95 7.25-26.75 3.74-11.87 6.75-23.99 8.73-36.27 3.13-30.28-4.36-61.63-21.36-86.9400002-9.69-14.94-22.86-27.37-37.27-37.7-17.94-12.08-39.04-19.45-60.59-21.28-20.12-1.95-40.33 2.57-58.84 10.31m-118.12 209.7100002c-2.82 5.99-1.75 12.93-.05 19.08 3.28 12.38 11.59 23.85 23.54 29.05.82-12.06.13-24.21.41-36.31 2.66-2.72 5.71-5.73 5.91-9.78.83-7.06-6.04-13.11-12.8-12.99-7.3-.52-13.97 4.59-17.01 10.95m303.71-.06c-.34 4.82 2.78 9.04 6.34 11.96.11 12.34-.01 24.69.05 37.04 14.96-8.16 25.67-24.79 25.01-42.08-.42-9.75-9.31-18.48-19.22-17.8-6.08-.19-11.86 4.71-12.18 10.88m-168.13 107.61c-4 2.76-6.36 7.61-6.15 12.46.02 14.66.01 29.32.14 43.98-.35 9.52-10.21 16.99-19.48 14.51-8.55-2.89-14.47-10.15-21.75-15.13.21 8 1.11 16.19 4.66 23.47 11.91 25.39 29.48 47.5 46.53 69.56 6.92 8.81 14.55 17.02 21.7 25.64 19.99-17.61 37.97-37.38 54.77-58.02 10.51-13.97 21.01-28.42 26.9-45.05 1.95-5.13 1.78-10.67 2.15-16.06-7.87 5.57-13.99 14.71-24.15 16.11-8.97 1.05-17.41-7.14-17.24-16.06.1-14.35.18-28.7.24-43.05.46-6.56-4.43-12.77-10.67-14.46-3.7-1.07-7.56-.38-11.34-.45-11.28-.43-22.58-.13-33.87-.24096-4.24.10096-8.87.18096-12.44 2.79096m-86.31 93.37c-2.6 8.18-1.63 16.91.52 25.07 5.4 20.72 14.82 40.13 25.16 58.79 9.41 15.33 19.26 30.5 30.84 44.31 11.07-8.54 21.83-17.46 32.66-26.3-8.53-9.64-16.45-19.79-24.46-29.86-10.7-13.78-21.58-27.48-30.78-42.32-6.08-9.74-12.31-19.42-17.14-29.85-2.42-5.43-5.17-10.84-5.82-16.83-4.97 4.64-8.88 10.5-10.98 16.99z" />
                    <path d="m214.459587 170.640274c13.91-.19 27.82-.12 41.74-.07 8.64-.29 15.6 8.54 14.7 16.83-.56 6.75-6.92 12.44-13.7 12.27-14.36 0-28.73-.01-43.09-.11-7.39-.04-13.91-6.89-13.69-14.26-.48-7.68 6.58-14.39 14.04-14.66z" />
                    <path d="m343.669587 170.820274c13.81-.77 27.66-.18 41.49-.3 7.14-.44 14.23 4.64 15.75 11.71 2.33 7.75-3.93 16.3-11.72 17.37-15.02.09-30.06.01-45.08.080209-8.49.049791-15.71-8.870209-13.75-17.170209 1.16-6.33 6.92-11.28 13.31-11.69z" />
                    <path d="m295.639587 278.050274c10.77-3.9 22.83 6.06 22.16 17.18-.56 9.87-11.28 17.21-20.73 14.89-7.1-1.15-13.07-7.56-13.33-14.81-.51-7.52 4.49-15.28 11.9-17.26z" />
                    <path d="m296.589587 372.830274c8.67-2.79 18.76 3.83 18.98 13.08.19 30.45.09 60.91.06 91.37.87 10.48-11.49 18.83-20.95 14.47-5.32-2.13-9.23-7.63-8.81-13.45.24-30.35-.08-60.7.02-91.05-.19-6.56 4.23-12.88 10.7-14.42z" />
                    <path d="m458.619587 572.950274c8.51-2.83 17.34 4.02 19.17 12.22.9 4.44-1.16 8.68-2.85 12.65-6.55 14.26-12.7 28.79-21.09 42.1-19.92 32.06-45.37 60.64-74.63 84.47-2.99 2.83-6.86 4.67-10.96 5.13-10.12 1.18-19.26-9.95-16.34-19.64 1.3-4.55 5.6-7.03 8.98-9.91 10.18-8.4 19.36-17.92 28.73-27.19 24.88-25.77 45.07-56.16 58.47-89.42 1.93-4.69 5.41-9.09 10.52-10.41z" />
                    <path d="m508.609587 634.060274c9.42-3.07 18.96 5.91 18.930071 15.2-.010071 22.01-.210071 44.03-.110071 66.04-.27 9.7-11.34 16.43-20.26 13.51-5.98-1.51-9.94-7.58-10.32-13.51-.25-22-.05-44.01-.15-66.02-.45-7.07 5.32-13.43 11.91-15.22z" />
                  </g>
                </svg>
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
