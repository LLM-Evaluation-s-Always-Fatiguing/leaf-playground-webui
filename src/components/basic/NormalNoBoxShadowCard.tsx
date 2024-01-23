import { Card } from 'antd';
import styled from '@emotion/styled';

const NormalNoBoxShadowCard = styled(Card)`
  :not(:hover) {
    box-shadow: none;
  }
`;

export default NormalNoBoxShadowCard;
