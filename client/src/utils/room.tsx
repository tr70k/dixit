import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ValueOf<T> = T[keyof T];

export const COLORS = {
  WHITE: 'WHITE',
  RED: 'RED',
  YELLOW: 'YELLOW',
  BLUE: 'BLUE',
  BLACK: 'BLACK',
  GREEN: 'GREEN',
  PINK: 'PINK',
  ORANGE: 'ORANGE',
} as const;

export type Color = ValueOf<typeof COLORS>;

export const STATUSES = {
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  LEAD_CHOOSES_CARD: 'LEAD_CHOOSES_CARD',
  OTHER_PLAYERS_CHOOSE_CARD: 'OTHER_PLAYERS_CHOOSE_CARD',
  OTHER_PLAYERS_VOTE: 'OTHER_PLAYERS_VOTE',
  ROUND_RESULTS: 'ROUND_RESULTS',
  GAME_RESULTS: 'GAME_RESULTS',
} as const;

export type Status = ValueOf<typeof STATUSES>;

export const PLAYER_STATUSES = {
  ACTIVE: 'ACTIVE',
  WAITING: 'WAITING',
  DISCONNECTED: 'DISCONNECTED',
} as const;

export type PlayerStatus = ValueOf<typeof PLAYER_STATUSES>;

export type Card = {
  id: string,
}

export type PublicCard = {
  id: Card['id'] | 'hidden',
  player: Color | null,
  selectedBy: Color[] | null,
}

export type Player = {
  id: string,
  socketId: string,
  color: Color,
  score: number,
  cards: Card[],
  status: PlayerStatus,
  awaiting: boolean,
}

export type PublicPlayer = Pick<Player, 'color' | 'score' | 'status' | 'awaiting'>

export type PublicRoom = {
  name: string,
  status: Status,
  players: PublicPlayer[],
  lead: Color | null,
  leadCardDescription: string | null,
  cards: PublicCard[],
}

export type Me = Pick<Player, 'color' | 'cards' | 'awaiting'>

export type PlayerState = {
  room: PublicRoom,
  me: Me,
}

interface ServerToClientEvents {
  state: (state: PlayerState) => void;
}

interface ClientToServerEvents {
  join: (data: { player: string, room: string }) => void;
  leave: () => void;
}

// todo

type Context = {
  room: PlayerState['room'] | null,
  me: PlayerState['me'] | null,
  join: (name: string) => Promise<void>,
  leave: () => Promise<void>
}

export const RoomContext = createContext<Context>({
  room: null,
  me: null,
  join: async () => void 0,
  leave: async () => void 0,
});

export type RoomProviderProps = {
  // roomName?: string
  children?: ReactNode
}

export const RoomProvider = (props: RoomProviderProps) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useRef(io(process.env.REACT_APP_SERVER_URL ?? '', {
    autoConnect: false,
  })).current;
  const [state, setState] = useState<PlayerState | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket connected: ', socket.connected); // true
    });

    socket.on('disconnect', () => {
      console.log('socket connected: ', socket.connected); // false
    });

    socket.on('state', (playerState) => {
      console.log('state:', playerState);
      setState(playerState);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  async function join(room1: string): Promise<void> {
    console.log('join mock');

    const player = document.location.pathname.split('/')[1] || 'Player';
    const room = document.location.pathname.split('/')[2] || 'Room';

    socket.emit('join', {
      player,
      room,
    });
  }

  async function leave(): Promise<void> {
    console.log('leave mock');

    socket.emit('leave');
  }

  return (
    <RoomContext.Provider
      value={{
        room: state?.room ?? null,
        me: state?.me ?? null,
        join,
        leave,
      }}
      {...props}
    />
  );
};

export function useRoom() {
  return useContext(RoomContext);
}
