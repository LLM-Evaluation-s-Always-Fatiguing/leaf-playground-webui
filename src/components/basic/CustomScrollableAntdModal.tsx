'use client';

import React from 'react';
import { Modal, ModalProps } from 'antd';

interface CustomScrollableAntdModalProps extends ModalProps {}

const CustomScrollableAntdModal: React.FC<CustomScrollableAntdModalProps> = (props) => {
  return <Modal wrapClassName={'custom-scrollable-antd-modal'} {...props} />;
};

export default CustomScrollableAntdModal;
