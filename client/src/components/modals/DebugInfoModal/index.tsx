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

type DebugInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugInfoModal = ({ isOpen, onClose }: DebugInfoModalProps) => {
  const { room, me } = useRoom();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        <Title>Debug info 🐞</Title>
        <DebugInfo>
          <pre>
            Room: {JSON.stringify(room, null, 2)}
          </pre>
          <pre>
            Me: {JSON.stringify(me, null, 2)}
          </pre>
        </DebugInfo>
      </>
    </Modal>
  );
};
