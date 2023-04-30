import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ShortUniqueId from 'short-unique-id';
import { useSnackbar } from 'notistack';

const uid = new ShortUniqueId();
const UID_LENGTH = 6;

type ValueOf<T> = T[keyof T];

export const PLAYERS_MIN_COUNT = 3;
export const PLAYERS_MAX_COUNT = 10;

export const COLORS = {
  ORANGE: 'ORANGE',
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  RED: 'RED',
  BROWN: 'BROWN',
  PURPLE: 'PURPLE',
  CYAN: 'CYAN',
  YELLOW: 'YELLOW',
  PINK: 'PINK',
  OLIVE: 'OLIVE',
  // LIME: 'LIME',
} as const;

export type Color = ValueOf<typeof COLORS>;

export const STATUSES = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  LEAD_CHOOSES_CARD: 'LEAD_CHOOSES_CARD',
  OTHER_PLAYERS_CHOOSE_CARD: 'OTHER_PLAYERS_CHOOSE_CARD',
  OTHER_PLAYERS_VOTE: 'OTHER_PLAYERS_VOTE',
  ROUND_CANCELED: 'ROUND_CANCELED',
  ROUND_RESULTS: 'ROUND_RESULTS',
  GAME_RESULTS: 'GAME_RESULTS',
} as const;

export type Status = ValueOf<typeof STATUSES>;

export type Card = {
  id: string,
}

export type TableCard = Card & {
  player: {
    id: Player['id'],
    color: Color,
  },
  selectedBy: Array<{
    id: Player['id'],
    color: Color,
  }>,
}

export type PublicCard = {
  id: TableCard['id'] | 'hidden',
  player: TableCard['player'] | null,
  isMyCard: boolean,
  selectedBy: TableCard['selectedBy'] | null,
}

export type Player = {
  id: string,
  socketId: string,
  color: Color,
  score: number,
  cards: Card[],
  isLeft: boolean,
  isPlaying: boolean,
  isAwaiting: boolean,
}

export type PublicPlayer = Pick<Player, 'id' | 'color' | 'score' | 'isPlaying' | 'isLeft' | 'isAwaiting'>

export type PublicRoom = {
  name: string,
  hasLeftPlayers: boolean,
  status: Status,
  players: PublicPlayer[],
  lead: {
    id: Player['id'],
    color: Color,
  } | null,
  leadCardDescription: string | null,
  cards: PublicCard[],
}

export type Me = Pick<Player, 'id' | 'color' | 'cards' | 'isPlaying' | 'isLeft' | 'isAwaiting'>

export type PlayerState = {
  room: PublicRoom,
  me: Me,
}

interface ServerToClientEvents {
  state: (state: PlayerState) => void;
  message: (message: string, variant?: 'success' | 'info' | 'error' | 'warning') => void;
}

interface ClientToServerEvents {
  create: (data: { player: string }) => void;
  join: (data: { player: string, room: string }) => void;
  leave: () => void;
  kick: (data: { color: Color }) => void;

  start: () => void;
  stop: () => void;
  leadChooseCard: (data: { cardId: Card['id'], cardDescription: string }) => void;
  otherPlayerChooseCard: (data: { cardId: Card['id'] }) => void;
  otherPlayerVote: (data: { cardId: Card['id'] }) => void;
  startNextRound: () => void;
}

// todo move types to separate file

type Context = {
  room: PlayerState['room'] | null,
  me: PlayerState['me'] | null,
  isLoaded: boolean,
  copyLink: () => void,
  create: () => void,
  join: (room: string) => void,
  leave: () => void,
  kick: (color: Color) => void,
  start: () => void,
  stop: () => void,
  leadChooseCard: (cardId: Card['id'], cardDescription: string) => void;
  otherPlayerChooseCard: (cardId: Card['id']) => void;
  otherPlayerVote: (cardId: Card['id']) => void;
  startNextRound: () => void;
}

export const RoomContext = createContext<Context>({
  room: null,
  me: null,
  isLoaded: false,
  copyLink: () => void 0,
  create: () => void 0,
  join: () => void 0,
  leave: () => void 0,
  kick: () => void 0,
  start: () => void 0,
  stop: () => void 0,
  leadChooseCard: () => void 0,
  otherPlayerChooseCard: () => void 0,
  otherPlayerVote: () => void 0,
  startNextRound: () => void 0,
});

const PLAYER_PARAM_NAME = 'player';

export type RoomProviderProps = {
  children?: ReactNode
}

export const RoomProvider = (props: RoomProviderProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useRef(io('/', {
    transports: ['websocket'],
    path: '/api',
    autoConnect: false,
  })).current;
  const [state, setState] = useState<PlayerState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const player = useMemo(() => {
    const playerQueryParam = (new URLSearchParams(window.location.search)).get(PLAYER_PARAM_NAME) ?? '';
    const playerLocalStorage = localStorage.getItem(PLAYER_PARAM_NAME) ?? '';

    const newPlayer = playerQueryParam.length === UID_LENGTH ?
      playerQueryParam :
      playerLocalStorage.length === UID_LENGTH ?
        playerLocalStorage :
        uid.randomUUID(UID_LENGTH);

    localStorage.setItem(PLAYER_PARAM_NAME, newPlayer);

    return newPlayer;
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      enqueueSnackbar('Connected to server', { variant: 'success' });
    });

    socket.on('disconnect', () => {
      setState(null);
      enqueueSnackbar('Lost connection to server', { variant: 'error' });
    });

    socket.on('state', (playerState) => {
      setState(playerState);
    });

    socket.on('message', (message, variant) => {
      enqueueSnackbar(message, { variant });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket - connection error:', err);
      enqueueSnackbar('Connection to server problem!', { variant: 'error' });
    });

    socket.connect();

    let timeoutId: NodeJS.Timeout | null = null;
    const parsedPathname = window.location.pathname.split('/');
    if (parsedPathname.length === 2 && parsedPathname[1].length === UID_LENGTH) {
      socket.emit('join', {
        player,
        room: parsedPathname[1],
      });
    } else if (window.location.pathname !== '/') {
      enqueueSnackbar('The link is incorrect or expired', { variant: 'error' });
    }
    timeoutId = setTimeout(() => setIsLoaded(true), 500);

    return () => {
      timeoutId && clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (state?.room?.name || isLoaded) {
      window.history.replaceState(null, '', `/${state?.room?.name ?? ''}${window.location.search}`);
    }
  }, [state?.room?.name, isLoaded]);

  function copyLink(): void {
    if (state?.room?.name) {
      navigator.clipboard.writeText(`${window.location.origin}/${state.room.name}`).then(() => {
        enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
      }).catch(() => {
        enqueueSnackbar('Failed to copy link - no permissions', { variant: 'error' });
      });
    }
  }

  function create(): void {
    socket.emit('create', {
      player,
    });
  }

  function join(room: string): void {
    if (room.length !== UID_LENGTH) {
      throw new Error('Invalid room');
    }

    socket.emit('join', {
      player,
      room,
    });
  }

  function leave(): void {
    socket.emit('leave');
    setState(null);
  }

  function kick(color: Color): void {
    socket.emit('kick', { color });
  }

  function start(): void {
    socket.emit('start');
  }

  function stop(): void {
    socket.emit('stop');
  }

  function leadChooseCard(cardId: Card['id'], cardDescription: string): void {
    socket.emit('leadChooseCard', { cardId, cardDescription });
  }

  function otherPlayerChooseCard(cardId: Card['id']): void {
    socket.emit('otherPlayerChooseCard', { cardId });
  }

  function otherPlayerVote(cardId: Card['id']): void {
    socket.emit('otherPlayerVote', { cardId });
  }

  function startNextRound(): void {
    socket.emit('startNextRound' );
  }

  return (
    <RoomContext.Provider
      value={{
        room: state?.room ?? null,
        me: state?.me ?? null,
        isLoaded,
        copyLink,
        create,
        join,
        leave,
        kick,
        start,
        stop,
        leadChooseCard,
        otherPlayerChooseCard,
        otherPlayerVote,
        startNextRound,
      }}
      {...props}
    />
  );
};

export function useRoom() {
  return useContext(RoomContext);
}
