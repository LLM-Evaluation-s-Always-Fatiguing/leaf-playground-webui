'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { SceneActionLog } from '@/types/server/common/Log';
import { Button, Collapse, Tabs } from 'antd';
import styled from '@emotion/styled';
import { IoLogoMarkdown } from 'react-icons/io5';
import { PiTree } from 'react-icons/pi';
import { TbCodeDots } from 'react-icons/tb';
import JSONCrackLogo from '@/assets/json/jsoncrack-logo.png';
import CustomFullFillAntdModal from '@/components/basic/CustomFullFillAntdModal';
import JsonCrackViewer from '@/components/common/JSONCrack';
import MonacoJSONEditor from '@/components/common/JSONEditor';
import JSONViewer from '@/components/common/JSONViewer';
import { getSceneLogMessageDisplayContent } from '@/utils/scene-log';

const TabsWrapper = styled.div`
  .ant-tabs-tabpane {
    padding-left: 0 !important;
  }
`;

const MarkdownContentItem = styled.div`
  padding: 0 16px 12px 16px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);
  background: ${(props) => (props.theme.isDarkMode ? 'rgba(255,255,255,0.08)' : 'white')};
  border-radius: ${(props) => props.theme.borderRadius}px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-shrink: 0;

  .head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    color: ${(props) => props.theme.colorTextTertiary};
    font-weight: 500;
  }

  .body {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    flex-shrink: 0;
  }
`;

const ScrollView = styled.div`
  width: 100%;
  height: 100%;
  max-height: 80vh;
  padding: 12px 16px;
  overflow: hidden auto;

  ${MarkdownContentItem} + ${MarkdownContentItem} {
    margin-top: 10px;
  }
`;

interface JSONViewModalProps {
  open: boolean;
  title?: string;
  jsonObject?: any;
  isSceneLog?: boolean;
  onNeedClose: () => void;
}

const JSONViewModal: React.FC<JSONViewModalProps> = ({ open, title, jsonObject, isSceneLog, onNeedClose }) => {
  const resetState = () => {};

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const log = isSceneLog ? (jsonObject as SceneActionLog) : undefined;

  return (
    <CustomFullFillAntdModal
      open={open}
      width={'max(960px, 90vw)'}
      destroyOnClose
      centered
      footer={null}
      onCancel={() => {
        onNeedClose();
      }}
      title={title || 'JSON Viewer'}
      styles={{
        body: {
          paddingLeft: '8px',
          paddingTop: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        },
      }}
    >
      <TabsWrapper>
        <Tabs
          tabPosition="left"
          type="card"
          style={{
            width: '100%',
            height: '100%',
          }}
          items={[
            ...(log
              ? [
                  {
                    key: 'log_markdown',
                    label: (
                      <div
                        style={{
                          width: '32px',
                          height: '28px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <IoLogoMarkdown size={'24px'} />
                      </div>
                    ),
                    children: (
                      <ScrollView>
                        <Collapse
                          defaultActiveKey={['references', 'response']}
                          ghost
                          items={[
                            ...(log.references
                              ? [
                                  {
                                    key: 'references',
                                    label: 'References',
                                    children: (
                                      <>
                                        {(log.references || []).map((reference, index) => {
                                          return (
                                            <MarkdownContentItem key={index}>
                                              <div className={'head'}>
                                                <div>{`${reference.sender.name} --> [${reference.receivers
                                                  .map((r: any) => r.name)
                                                  .join(', ')}]: `}</div>
                                              </div>
                                              <div className={'body'}>
                                                {getSceneLogMessageDisplayContent(reference, true)}
                                              </div>
                                            </MarkdownContentItem>
                                          );
                                        })}
                                      </>
                                    ),
                                  },
                                ]
                              : []),
                            {
                              key: 'response',
                              label: 'Response',
                              children: (
                                <MarkdownContentItem>
                                  <div className={'head'}>
                                    <div>
                                      {log.log_msg ||
                                        `${log.response.sender.name} --> [${log.response.receivers
                                          .map((r: any) => r.name)
                                          .join(', ')}]: `}
                                    </div>
                                  </div>
                                  <div className={'body'}>{getSceneLogMessageDisplayContent(log.response, true)}</div>
                                </MarkdownContentItem>
                              ),
                            },
                          ]}
                        />
                      </ScrollView>
                    ),
                  },
                ]
              : []),
            {
              key: 'tree',
              label: (
                <div
                  style={{
                    width: '32px',
                    height: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <PiTree size={'24px'} />
                </div>
              ),
              children: (
                <ScrollView>
                  <JSONViewer jsonObject={jsonObject} />
                </ScrollView>
              ),
            },
            {
              key: 'code',
              label: (
                <div
                  style={{
                    width: '32px',
                    height: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TbCodeDots size={'24px'} />
                </div>
              ),

              children: <MonacoJSONEditor readonly={true} value={JSON.stringify(jsonObject, null, 2)} />,
            },
            {
              key: 'jsoncrack',
              label: (
                <div
                  style={{
                    width: '32px',
                    height: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    src={JSONCrackLogo}
                    width={24}
                    height={24}
                    style={{
                      borderRadius: '50%',
                    }}
                    alt={'JSONCrack Logo'}
                  />
                </div>
              ),
              children: (
                <div
                  style={{
                    height: '80vh',
                  }}
                >
                  <JsonCrackViewer jsonObject={jsonObject} />
                </div>
              ),
            },
          ]}
        />
      </TabsWrapper>
    </CustomFullFillAntdModal>
  );
};

export default JSONViewModal;
