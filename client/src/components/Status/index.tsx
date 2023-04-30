import React from 'react';
import styled from 'styled-components';
import { useRoom } from '../../utils/room';
import { Avatar, getName } from '../base/Avatar';

const Wrapper = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.m}px;
  
  h3, h4 {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0 ${(props) => props.theme.spacing.s}px;
  }
  
  div {
    margin-right: ${(props) => props.theme.spacing.s}px;
  }
`;

export const Status = () => {
  const { room, me } = useRoom();

  if (!room || !me) {
    return null;
  }

  const getLead = () => room.lead && <><Avatar player={room.lead} /> {getName(room.lead)}</>;

  const getStatus = () => {
    switch (room.status) {
    case 'WAITING_FOR_PLAYERS':
      return <h3>Waiting for players ⏳</h3>;
    case 'GAME_NOT_STARTED':
      return <h3>Game not started 🏎</h3>;
    case 'LEAD_CHOOSES_CARD':
      return <h3>{getLead()} chooses card and description 🌁</h3>;
    case 'OTHER_PLAYERS_CHOOSE_CARD':
      return <h3>{getLead()} chose &quot;{room.leadCardDescription}&quot; • Similar one? 🪤</h3>;
    case 'OTHER_PLAYERS_VOTE':
      return <h3>{getLead()} chose &quot;{room.leadCardDescription}&quot; • Best matched? 🔮</h3>;
    case 'ROUND_CANCELED':
      return <h3>Round was canceled 😔</h3>;
    case 'ROUND_RESULTS':
      return <h3>{getLead()} chose &quot;{room.leadCardDescription}&quot; • Round results! 🎉</h3>;
    case 'GAME_RESULTS':
      return <h3>Game results! 😎</h3>;
    }
    return <h3 />;
  };

  const getStatusDescription = () => {
    switch (room.status) {
    case 'WAITING_FOR_PLAYERS':
      return <h4>Invite your friends!</h4>;
    case 'GAME_NOT_STARTED':
      return <h4>Let&apos;s play!</h4>;
    case 'LEAD_CHOOSES_CARD':
      return <h4>{room.lead?.color === me.color ? 'Choose your card!' : 'Lead chooses a card...'}</h4>;
    case 'OTHER_PLAYERS_CHOOSE_CARD':
      return <h4>{room.lead?.color !== me.color && me.isAwaiting ? 'Choose your card!' : 'Other players choose cards...'}</h4>;
    case 'OTHER_PLAYERS_VOTE':
      return <h4>{room.lead?.color !== me.color && me.isAwaiting ? 'Vote for the card!' : 'Other players vote for cards...'}</h4>;
    case 'ROUND_CANCELED':
      return <h4>Ready for the next round?</h4>;
    case 'ROUND_RESULTS':
      return <h4>Ready for the next round?</h4>;
    case 'GAME_RESULTS':
      return <h4>One more game?</h4>;
    }
    return <h4 />;
  };

  if (room.hasLeftPlayers) {
    return (
      <Wrapper>
        <h3>Waiting for disconnected players ⏳</h3>
        <h4>You can wait or kick the player by the ❌ button...</h4>;
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {getStatus()}
      {getStatusDescription()}
    </Wrapper>
  );
};
