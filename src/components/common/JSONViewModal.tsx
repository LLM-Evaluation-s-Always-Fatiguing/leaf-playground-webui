'use client';

import React, { useEffect } from 'react';
import JSONViewer from '@/components/common/JSONViewer';
import { Tabs } from 'antd';
import CustomFullFillAntdModal from '@/components/basic/CustomFullFillAntdModal';
import styled from '@emotion/styled';
import MonacoJSONEditor from '@/components/common/JSONEditor';
import { PiTree } from 'react-icons/pi';
import { TbCodeDots } from 'react-icons/tb';
import JsonCrackViewer from '@/components/common/JSONCrack';
import Image from 'next/image';
import JSONCrackLogo from '@/assets/json/jsoncrack-logo.png';

const TabsWrapper = styled.div`
  .ant-tabs-tabpane {
    padding-left: 0 !important;
  }
`;

const ScrollView = styled.div`
  width: 100%;
  height: 100%;
  max-height: 80vh;
  padding: 12px 16px;
  overflow: hidden auto;
`;

interface JSONViewModalProps {
  open: boolean;
  title?: string;
  jsonObject?: object | any[];
  onNeedClose: () => void;
}

const JSONViewModal: React.FC<JSONViewModalProps> = ({ open, title, jsonObject, onNeedClose }) => {
  const resetState = () => {};

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  return (
    <CustomFullFillAntdModal
      open={open}
      width={960}
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
