import styled from 'styled-components';
import { IconButton } from '../base/IconButton';
import { Avatar } from '../base/Avatar';

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: -16px;
`;

export const CardCoverWrapper = styled.div`
  flex: 1;
  background: transparent;
  transform-style: preserve-3d;
  perspective: 5000px;

  .card-content {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;

    border-radius: 8px;
    overflow: hidden;
    box-shadow: rgba(100, 100, 111, 0.2) 0 7px 29px 0;

    img:first-child {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
  }

  .card-front {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(180deg);
  }

  .card-back {
    pointer-events: none;
  }

  .front-card-transition-enter {
    transform: rotateY(180deg);
  }
  .front-card-transition-enter-active {
    transition: all 150ms ease;
    transform: rotateY(0deg);
  }
  .front-card-transition-enter-done {
    transform: rotateY(0deg);
  }

  .front-card-transition-exit {
    transform: rotateY(0deg);
  }
  .front-card-transition-exit-active {
    transform: rotateY(180deg);
    transition: all 150ms ease;
  }
  .front-card-transition-exit-done {
    transform: rotateY(180deg);
  }

  .back-card-transition-enter {
    transform: rotateY(-180deg);
  }
  .back-card-transition-enter-active {
    transform: rotateY(0deg);
    transition: all 150ms ease;
  }
  .back-card-transition-enter-done {
    transform: rotateY(0deg);
  }

  .back-card-transition-exit {
    transform: rotateY(0deg);
  }
  .back-card-transition-exit-active {
    transform: rotateY(-180deg);
    transition: all 150ms ease;
  }
  .back-card-transition-exit-done {
    transform: rotateY(-180deg);
  }
`;

export const AnimatedCard = styled.label<{ isEditable?: boolean; isResults?: boolean; isLeadCard?: boolean, isMyVote?: boolean, isMyCard?: boolean, isPublic?: boolean }>`
  aspect-ratio: 2 / 3;
  min-width: ${({ isPublic }) => isPublic ? 150 : 100}px;
  width: calc(100% / ${({ isPublic }) => isPublic ? 8 : 10});
  position: relative;
  display: flex;
  justify-content: center;

  transition: all 150ms ease-in-out;

  ${({ isResults, isLeadCard }) => isResults && isLeadCard && 'transform: scale(1.1)'};
  
  .card-content {
    ${({ theme, isResults, isMyVote, isMyCard, isLeadCard }) => isResults && (isMyVote || isMyCard) && `outline: 2px solid ${isMyCard ? theme.colors.cyan : isLeadCard ? theme.colors.green : theme.colors.red}`};
  }

  img {
    ${({ isResults, isLeadCard }) => isResults && isLeadCard === false && 'filter: grayscale(100%)'};
  }

  [type=radio] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  &:has([type=radio]) {
    cursor: ${({ isEditable }) => isEditable && 'pointer'};
  }

  &:has([type=radio]:disabled) {
    cursor: ${({ isEditable }) => isEditable && 'not-allowed'};
  }

  &:has([type=radio]:checked) {
    transform: scale(1.1);

    .card-content {
      outline: 2px solid ${({ theme }) => theme.colors.cyan};
    }
  }

  margin: 16px 0 0 16px;

  &.fade-enter {
    min-width: 0;
    width: 0;
    opacity: 0;
    margin-left: 0;
  }

  &.fade-enter-active {
    min-width: ${({ isPublic }) => isPublic ? 150 : 100}px;
    width: calc((100% - 96px) / 10);
    opacity: 1;
    margin-left: 16px;
  }

  &.fade-exit {
    min-width: ${({ isPublic }) => isPublic ? 150 : 100}px;
    width: calc((100% - 96px) / 10);
    opacity: 1;
    margin-left: 16px;
  }

  &.fade-exit-active {
    min-width: 0;
    width: 0;
    opacity: 0;
    margin-left: 0;
  }
`;

export const ViewButton = styled(IconButton)`
  position: absolute;
  top: 4px;
  right: 4px;
`;

export const ActionWrapper = styled.div<{ isMy?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: ${({ isMy }) => isMy ? 16 : 32}px;
  height: 40px;
`;

export const CardByAvatar = styled(Avatar)`
  position: absolute;
  left: 8px;
  bottom: 8px;
`;

export const SelectedByList = styled.ul`
  position: absolute;
  top: 56px;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap-reverse;
  justify-content: end;
  margin: 0;
  padding: 0;
  gap: 8px;
  
  li {
    list-style: none;
  }
`;

export const Logo = styled.img`
  position: absolute;
  height: 56px;
  top: 50%;
  margin-top: -28px;
`;
