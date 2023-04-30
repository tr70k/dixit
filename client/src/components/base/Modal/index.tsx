import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';
import { IconButton } from '../IconButton';

const Wrapper = styled.div`
  &.modal {
    position: fixed;
    inset: 0; /* inset sets all 4 values (top right bottom left) much like how we set padding, margin etc., */
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    //transition: all 0.3s ease-in-out;
    overflow: hidden;
    z-index: 999;
  }

  //&.modal-content {
  //  width: 70%;
  //  height: 70%;
  //  background-color: #282c34;
  //  color: #fff;
  //  display: flex;
  //  align-items: center;
  //  justify-content: center;
  //  font-size: 2rem;
  //}

  &.modal-enter {
    opacity: 0;
    background-color: rgba(0, 0, 0, 0);
    //transform: scale(0.9);
  }
  &.modal-enter-active {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.6);
    //transform: translateX(0);
    transition: opacity 300ms, transform 300ms, background-color 300ms;
  }
  &.modal-exit {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.6);
  }
  &.modal-exit-active {
    opacity: 0;
    background-color: rgba(0, 0, 0, 0);
    //transform: scale(0.9);
    transition: opacity 300ms, transform 300ms, background-color 300ms;
  }
`;

const Content = styled.div`
  //display: flex;
  position: relative;
  min-width: 400px;
  max-width: 90%;
  min-height: 200px;
  max-height: 90%;
  background-color: white;
  overflow: hidden;
  border-radius: 16px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 20px;
`;

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute('id', wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

type ReactPortalProps = {
  children: ReactNode,
  wrapperId?: string,
}

const ReactPortal = ({ children, wrapperId = 'react-portal-wrapper' }: ReactPortalProps) => {
  let element = document.getElementById(wrapperId);
  // if element is not found with wrapperId,
  // create and append to body
  if (!element) {
    element = createWrapperAndAppendToBody(wrapperId);
  }

  return createPortal(children, element);
};

type ModalProps = {
  children: ReactNode,
  isOpen: boolean,
  onClose: () => void,
  withoutCloseButton?: boolean
}

export const Modal = ({ children, isOpen, onClose, withoutCloseButton = false }: ModalProps) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => e.key === 'Escape' ? onClose() : null;
    document.body.addEventListener('keydown', closeOnEscapeKey);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey);
    };
  }, [onClose]);

  return (
    <ReactPortal wrapperId='react-portal-modal-container'>
      <CSSTransition
        in={isOpen}
        timeout={300}
        unmountOnExit
        classNames='modal'
        nodeRef={nodeRef}
      >
        <Wrapper className='modal' ref={nodeRef} onClick={onClose}>
          <Content onClick={e => e.stopPropagation()}>
            {children}
            {!withoutCloseButton && (
              <CloseButton
                onClick={onClose}
                data-tooltip-id='modal-tooltip'
                data-tooltip-content='Close'
              >
                ✖
              </CloseButton>
            )}
          </Content>
          <Tooltip id='modal-tooltip' />
        </Wrapper>
      </CSSTransition>
    </ReactPortal>
  );
};
