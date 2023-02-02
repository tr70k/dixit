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

const ALL_COLORS: Color[] = [
  COLORS.WHITE,
  COLORS.RED,
  COLORS.YELLOW,
  COLORS.BLUE,
  COLORS.BLACK,
  COLORS.GREEN,
  COLORS.PINK,
  COLORS.ORANGE,
];

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

const EXTERNAL_CARDS_COUNT = 10; // todo: temp 372;

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
}

const CARDS = new Array(EXTERNAL_CARDS_COUNT).fill(0).map(i => ({ id: String(i + 1) } as Card));

export type TableCard = Card & {
  player: Color,
  selectedBy: Color[],
}

export type PublicCard = {
  id: Card['id'] | 'hidden',
  player: Color | null,
  selectedBy: Color[] | null,
}

const PLAYERS_MIN_COUNT = 3;
const PLAYERS_MAX_COUNT = 10;

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

export type State = Record<Player['socketId'], PlayerState>

export class Room {
  private readonly name: string;
  private status: Status = STATUSES.GAME_NOT_STARTED;
  private players: Player[] = [];
  private lead: Color | null = null;
  private leadCardDescription: string | null = null;
  private availableCards: Card[] = [];
  private cards: TableCard[] = [];

  constructor(name: string) {
    this.name = name;
    this.availableCards = shuffleArray(CARDS);
  }

  getName(): string {
    return this.name;
  }

  private getActivePlayers(): Player[] {
    return this.players.filter(({ status }) => status === PLAYER_STATUSES.ACTIVE);
  }

  isEmpty(): boolean {
    return !this.getActivePlayers().length;
  }

  isFull(): boolean {
    return this.players.length === PLAYERS_MAX_COUNT;
  }

  join({ id, socketId }: Pick<Player, 'id' | 'socketId'>): Color | null {
    const existingPlayer = this.players.find(player => player.id === id);

    if (existingPlayer) {
      existingPlayer.socketId = socketId; // todo: do we really need?
      existingPlayer.status = PLAYER_STATUSES.ACTIVE;
      return existingPlayer.color;
    }

    if (this.isFull()) {
      return null;
    }

    const color: Color = ALL_COLORS.find(color => !this.players.some(player => player.color === color)) ?? COLORS.BLACK;
    this.players.push({
      id,
      socketId,
      color,
      score: 0,
      cards: [],
      status: this.status === STATUSES.GAME_NOT_STARTED ? PLAYER_STATUSES.ACTIVE : PLAYER_STATUSES.WAITING,
      awaiting: false,
    });

    return color;
  }

  leave(color: Color, forever = false): void {
    if (forever) {
      this.players = this.players.filter(player => player.color !== color);
    } else {
      const existingPlayer = this.players.find(player => player.color === color);
      if (existingPlayer) {
        existingPlayer.status = PLAYER_STATUSES.DISCONNECTED;
      }
    }

    if (this.getActivePlayers().length < PLAYERS_MIN_COUNT) {
      this.status = STATUSES.GAME_RESULTS;
    }
  }

  getStateForPlayers(): State {
    return this.getActivePlayers().reduce((state, player) => {
      state[player.socketId] = {
        room: {
          name: this.name,
          status: this.status,
          players: this.players.map(player => ({
            color: player.color,
            score: player.score,
            status: player.status,
            awaiting: player.awaiting,
          })),
          lead: this.lead,
          leadCardDescription: this.leadCardDescription,
          cards: this.status === STATUSES.ROUND_RESULTS ? this.cards : this.cards.map(({ id }): PublicCard => ({
            id: this.status === STATUSES.OTHER_PLAYERS_VOTE ? id : 'hidden',
            player: null,
            selectedBy: null,
          })),
        },
        me: {
          color: player.color,
          cards: player.cards,
          awaiting: player.awaiting,
        }
      };

      return state;
    }, {} as State);
  }
}
