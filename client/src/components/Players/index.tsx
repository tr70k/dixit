import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'react-tooltip';
import { Avatar, getName } from '../base/Avatar';
import { useRoom } from '../../utils/room';

const Wrapper = styled.div`
  border: 1px solid blue;
  min-width: 200px;
  
  display: flex;
  flex-direction: column;
  width: max-content;
  gap: ${(props) => props.theme.spacing.xs}px;
  
  .clickable {
    cursor: pointer;
  }
`;

export const Players = () => {
  const { room, kick } = useRoom();

  if (!room) {
    return null;
  }

  return <Wrapper>
    {room.players.map((player) => (
      <div key={player.color}>
        <span
          data-tooltip-id='player-tooltip'
          data-tooltip-content={player.isLeft ? 'Disconnected • Click to kick' : !player.isPlaying ? 'Spectator' : player.isAwaiting ? 'Awaiting...' : 'Ready'}
          onClick={() => player.isLeft && kick(player.color)}
          className={player.isLeft ? 'clickable' : undefined}
        >
          {player.isLeft ? '❌' : !player.isPlaying ? '👀' : player.isAwaiting ? '⏳' : '✅'}
        </span>
        <Avatar player={player} ml='s' mr='s' />
        {getName(player)} • {player.score}
      </div>
    ))}
    <Tooltip id='player-tooltip' />
  </Wrapper>;
};
