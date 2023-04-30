import React, { useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Tooltip } from 'react-tooltip';
import { useRoom, Card as CardType, PublicCard } from '../../utils/room';
import { ImageViewer } from '../ImageViewer';
import { Avatar } from '../base/Avatar';
import { Button } from '../base/Button';
import { Input } from '../base/Input';
import {
  ActionWrapper,
  AnimatedCard,
  CardByAvatar,
  CardCoverWrapper,
  Logo,
  SelectedByList,
  ViewButton,
  Wrapper
} from './styled';

function loadImage(src: string) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
    image.src = src;
  });
}

type AnimatedCardCoverProps = {
  src: string | null;
  alt: string;
  children: JSX.Element;
}

const AnimatedCardCover = ({ src, alt, children }: AnimatedCardCoverProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (src) {
      loadImage(src).then(() => setIsLoaded(true)).catch(() => setIsLoaded(false));
    }
  }, [src]);

  return (
    <CardCoverWrapper>
      <CSSTransition
        in={isLoaded}
        timeout={150}
        classNames='front-card-transition'
      >
        <div className='card-content card-front'>
          <img src={src ?? ''} alt={alt} />
          {children}
        </div>
      </CSSTransition>
      <CSSTransition
        in={!isLoaded}
        timeout={150}
        classNames='back-card-transition'
      >
        <div className='card-content card-back'>
          <img src='/back.svg' alt={alt} />
          <Logo src='/logo256.png' alt="What's my card?" />
        </div>
      </CSSTransition>
    </CardCoverWrapper>
  );
};

type CardsProps = {
  isMy?: boolean;
}

export const Cards = ({ isMy = false }: CardsProps) => {
  const { room, me, copyLink, leadChooseCard, otherPlayerChooseCard, otherPlayerVote, startNextRound, start } = useRoom();
  const [selectedCardId, setSelectedCardId] = useState<CardType['id'] | null>(null);
  const [selectedCardDescription, setSelectedCardDescription] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  if (!room || !me) {
    return null;
  }

  const cards = (isMy ? (me.cards.map((card) => ({
    ...card,
    player: me,
    selectedBy: null,
    isMyCard: false,
  } as PublicCard)) as PublicCard[]) : room.cards).map((card, index) => ({
    ...card,
    src: `https://play-tixid.online/cards/card_${card.id}.jpg`,
    alt: `Card ${index + 1}`,
  }));

  return (
    <>
      <Wrapper>
        <TransitionGroup component={null}>
          {cards.map((card, index) => {
            const isEditable = isMy ? (
              (room.status === 'LEAD_CHOOSES_CARD' && room.lead?.color === me.color) ||
              (room.status === 'OTHER_PLAYERS_CHOOSE_CARD' && me?.isAwaiting)
            ) : (room.status === 'OTHER_PLAYERS_VOTE' && me?.isAwaiting && !card.isMyCard);

            return (
              <CSSTransition
                timeout={500}
                classNames="fade"
                key={isMy ? card.id : index}
              >
                <AnimatedCard
                  isEditable={isEditable}
                  isResults={!isMy && room.status === 'ROUND_RESULTS' || room.status === 'GAME_RESULTS'}
                  isLeadCard={card.player?.color === room.lead?.color}
                  isMyCard={!me?.isAwaiting && card.isMyCard}
                  isMyVote={!!card.selectedBy?.find(selectedByPlayer => selectedByPlayer.color === me.color)}
                  isPublic={!isMy}
                  onClick={(e) => {
                    if (isEditable && selectedCardId === card.id) {
                      setSelectedCardId(null);
                      e.preventDefault();
                    }
                  }}
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={!isMy && room.status === 'OTHER_PLAYERS_VOTE' && me?.isAwaiting && card.isMyCard ? 'Can\'t choose your card' : ''}
                >
                  <input
                    disabled={!isEditable}
                    type='radio'
                    name='selectedCardId'
                    checked={selectedCardId === card.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCardId(card.id);
                      }
                    }}
                  />
                  <AnimatedCardCover src={card.id !== 'hidden' ? card.src : null} alt={card.alt}>
                    <>
                      <ViewButton
                        onClick={() => {
                          setImageViewerIndex(index);
                          setIsImageViewerOpen(true);
                        }}
                        data-tooltip-id='card-tooltip'
                        data-tooltip-content='View'
                      >
                        🔍
                      </ViewButton>
                      {(card.player || card.isMyCard) && (
                        <CardByAvatar
                          player={card.player ?? me}
                          data-tooltip-id='card-tooltip'
                          data-tooltip-content='Card owner'
                        />
                      )}
                      <SelectedByList key={index}>
                        {card.selectedBy?.map(selectedByPlayer => (
                          <li key={selectedByPlayer.color}>
                            <Avatar
                              player={selectedByPlayer}
                              data-tooltip-id='card-tooltip'
                              data-tooltip-content='Chose this card'
                            />
                          </li>
                        ))}
                      </SelectedByList>
                    </>
                  </AnimatedCardCover>
                </AnimatedCard>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </Wrapper>
      <ActionWrapper isMy={isMy}>
        {
          isMy ? <>
            {room.status === 'LEAD_CHOOSES_CARD' && room.lead?.color === me.color &&
              <>
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={selectedCardDescription.length === 30 ? 'Max length 30 characters' : ''}
                >
                  <Input
                    value={selectedCardDescription}
                    onChange={(e) => setSelectedCardDescription(e.target.value.slice(0, 30))}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter' && selectedCardId && selectedCardDescription) {
                        leadChooseCard(selectedCardId, selectedCardDescription);
                        setSelectedCardId(null);
                        setSelectedCardDescription('');
                      }}
                    }
                    placeholder='Selected card description'
                    width={300}
                  />
                </div>
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={room.hasLeftPlayers ? 'Waiting for disconnected players...' : !selectedCardId ? 'Choose your card' : !selectedCardDescription ? 'Add card description' : ''}
                >
                  <Button
                    onClick={() => {
                      if (selectedCardId && selectedCardDescription) {
                        leadChooseCard(selectedCardId, selectedCardDescription);
                        setSelectedCardId(null);
                        setSelectedCardDescription('');
                      }
                    }}
                    disabled={room.hasLeftPlayers || !selectedCardId || !selectedCardDescription}
                    width={100}
                  >
                    Submit
                  </Button>
                </div>
              </>
            }
            {
              (room.status === 'OTHER_PLAYERS_CHOOSE_CARD' && me.isAwaiting) && (
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={room.hasLeftPlayers ? 'Waiting for disconnected players...' : !selectedCardId ? 'Choose your card' : ''}
                >
                  <Button
                    onClick={() => {
                      if (selectedCardId) {
                        otherPlayerChooseCard(selectedCardId);
                        setSelectedCardId(null);
                      }
                    }}
                    disabled={room.hasLeftPlayers || !selectedCardId}
                    width={100}
                  >
                    Submit
                  </Button>
                </div>
              )
            }
          </> : <>
            {
              room.status === 'OTHER_PLAYERS_VOTE' && me.isAwaiting && (
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={room.hasLeftPlayers ? 'Waiting for disconnected players...' : !selectedCardId ? 'Choose a lead card' : ''}
                >
                  <Button
                    onClick={() => {
                      if (selectedCardId) {
                        otherPlayerVote(selectedCardId);
                        setSelectedCardId(null);
                      }
                    }}
                    disabled={room.hasLeftPlayers || !selectedCardId}
                    width={200}
                  >
                    Submit
                  </Button>
                </div>
              )
            }
            {
              room.status === 'WAITING_FOR_PLAYERS' && (
                <Button onClick={copyLink} width={200}>Copy room link</Button>
              )
            }
            {
              (room.status === 'ROUND_RESULTS' || room.status === 'ROUND_CANCELED') && me.isPlaying && (
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={room.hasLeftPlayers ? 'Waiting for disconnected players...' : ''}
                >
                  <Button disabled={room.hasLeftPlayers} onClick={startNextRound} width={200}>Start next round</Button>
                </div>
              )
            }
            {
              (room.status === 'GAME_NOT_STARTED' || (room.status === 'GAME_RESULTS' && me.isPlaying)) && (
                <div
                  data-tooltip-id='card-tooltip'
                  data-tooltip-content={room.hasLeftPlayers ? 'Waiting for disconnected players...' : ''}
                >
                  <Button disabled={room.hasLeftPlayers} onClick={start} width={200}>Start new game</Button>
                </div>
              )
            }
          </>
        }
      </ActionWrapper>
      <Tooltip id='card-tooltip' />
      {!!cards.length && <ImageViewer
        isOpen={isImageViewerOpen}
        initialIndex={imageViewerIndex}
        onClose={() => setIsImageViewerOpen(false)}
        images={cards}
      />}
    </>
  );
};
