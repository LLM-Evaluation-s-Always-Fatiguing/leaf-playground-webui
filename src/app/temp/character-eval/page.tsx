'use client';

import React from 'react';
import { Card, Collapse } from 'antd';
import styled from '@emotion/styled';
import CharacterEvalDefaultReport from '@/components/result/specialized/character-eval/DefaultReport';
import CharacterEvalCompareReport from '@/components/result/specialized/character-eval/CompareReport';

const CustomCollapseWrapper = styled.div`
  .ant-collapse {
    border-radius: 0;
    border: none;

    .ant-collapse-item {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-color: ${(props) => props.theme.colorBorderSecondary};

      .ant-collapse-header {
        flex-direction: row-reverse !important;
        align-items: center !important;

        .ant-collapse-header-text + .ant-collapse-extra {
          margin-right: 8px;
        }
      }

      .ant-collapse-content {
        border-color: ${(props) => props.theme.colorBorderSecondary};
      }
    }

    > .ant-collapse-item:last-child {
      border-bottom: none;
    }
  }
`;

const TempCharacterEvalReportPage = () => {
  return (
    <Card
      title={'Report'}
      bodyStyle={{
        padding: 0,
      }}
    >
      <CustomCollapseWrapper>
        <Collapse
          defaultActiveKey={['default', 'compare']}
          items={[
            {
              key: 'default',
              label: 'Default',
              children: <CharacterEvalDefaultReport scene={{} as any} createSceneParams={{} as any} logs={[]} />,
            },
            {
              key: 'compare',
              label: 'Compare',
              children: <CharacterEvalCompareReport scene={{} as any} createSceneParams={{} as any} logs={[]} />,
            },
          ]}
        />
      </CustomCollapseWrapper>
    </Card>
  );
};

export default TempCharacterEvalReportPage;
