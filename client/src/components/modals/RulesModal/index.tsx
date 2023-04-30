import React from 'react';
import styled from 'styled-components';
import { Modal } from '../../base/Modal';
import { useRoom } from '../../../utils/room';

const Title = styled.h3`
  text-align: center;
`;

const DebugInfo = styled.div`
  height: calc(100% - 96px);
  width: 600px;
  overflow-y: auto;
  padding: 0 ${({ theme }) => theme.spacing.l}px;
`;

type RulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        <Title>Rules ❓</Title>
        <pre>
          {'// todo add rules here'}
        </pre>
      </>
    </Modal>
  );
};
