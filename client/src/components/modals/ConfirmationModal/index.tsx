import React, { MutableRefObject, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Modal } from '../../base/Modal';
import { Box } from '../../base/Box';
import { Button } from '../../base/Button';

const Title = styled.h3`
  text-align: center;
`;

const Question = styled(Box)`
  text-align: center;
`;

const Buttons = styled(Box)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.m}px;
`;

type ConfirmationModalProps = {
  title: string;
  question: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const ConfirmationModal = ({ title, question, isOpen, onClose, onSubmit }: ConfirmationModalProps) => {
  const buttonRef: MutableRefObject<HTMLButtonElement | null> = useRef(null);

  useEffect(() => {
    isOpen && buttonRef.current?.focus();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        <Title>{title}</Title>
        <Question ml='m' mr='m'>{question}</Question>
        <Buttons ml='m' mr='m' mt='xl'>
          <Button ref={buttonRef} onClick={onClose} width={176}>No</Button>
          <Button onClick={onSubmit} width={176}>Yes</Button>
        </Buttons>
      </>
    </Modal>
  );
};
