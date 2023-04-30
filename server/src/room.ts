type ValueOf<T> = T[keyof T];

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

const ALL_COLORS: Color[] = [
  COLORS.ORANGE,
  COLORS.GREEN,
  COLORS.BLUE,
  COLORS.RED,
  COLORS.BROWN,
  COLORS.PURPLE,
  COLORS.CYAN,
  COLORS.YELLOW,
  COLORS.PINK,
  COLORS.OLIVE,
  // COLORS.LIME,
];

export const PLAYERS_MIN_COUNT = 3;
export const PLAYERS_MAX_COUNT = 8;
export const PLAYER_CARDS_COUNT = 7;
export const EXTERNAL_CARDS_COUNT = 372;

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

const CARDS = new Array(EXTERNAL_CARDS_COUNT).fill(0).map((_, i) => ({ id: String(i + 1) } as Card));

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
  color: Color,
  score: number,
  cards: Card[],
  isLeft: boolean,
  isPlaying: boolean,
  isAwaiting: boolean,
}

export type PublicPlayer = Pick<Player, 'id' | 'color' | 'score' | 'isLeft' | 'isPlaying' | 'isAwaiting'>

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

export type Me = Pick<Player, 'id' | 'color' | 'isLeft' | 'isPlaying' | 'cards' | 'isAwaiting'>

export type PlayerState = {
  room: PublicRoom,
  me: Me,
}

export type State = Record<Player['id'], PlayerState>

export class Room {
  private readonly name: string;
  private colors = shuffleArray(ALL_COLORS);
  private hasLeftPlayers = false;
  private status: Status = STATUSES.WAITING_FOR_PLAYERS;
  private players: Player[] = [];
  private lead: {
    id: Player['id'],
    color: Color,
  } | null = null;
  private leadCardDescription: string | null = null;
  private availableCards: Card[] = [];
  private cards: TableCard[] = [];

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  private getPlayingPlayers(): Player[] {
    return this.players.filter(({ isPlaying }) => isPlaying);
  }

  private getNotLeftPlayers(): Player[] {
    return this.players.filter(({ isLeft }) => !isLeft);
  }

  private isGameInProgress(): boolean {
    return this.status !== STATUSES.WAITING_FOR_PLAYERS && this.status !== STATUSES.GAME_NOT_STARTED && this.status !== STATUSES.GAME_RESULTS;
  }

  isEmpty(): boolean {
    return !this.getNotLeftPlayers().length;
  }

  isFull(): boolean {
    return this.players.length === PLAYERS_MAX_COUNT;
  }

  private resetHasNotLeftPlayers(): void {
    this.hasLeftPlayers = this.players.length !== this.getNotLeftPlayers().length;
  }

  join(id: string): Color | null {
    const existingPlayer = this.players.find(player => player.id === id);

    if (existingPlayer) {
      existingPlayer.isLeft = false;
      this.resetHasNotLeftPlayers();
      return existingPlayer.color;
    }

    if (this.isFull()) {
      return null;
    }

    const color: Color = this.colors.find(color => !this.players.some(player => player.color === color)) ?? COLORS.ORANGE;
    this.players.push({
      id,
      color,
      score: 0,
      cards: [],
      isLeft: false,
      isPlaying: !this.isGameInProgress(),
      isAwaiting: false,
    });

    if (this.status === STATUSES.WAITING_FOR_PLAYERS && this.players.length >= PLAYERS_MIN_COUNT) {
      this.status = STATUSES.GAME_NOT_STARTED;
    }

    return color;
  }

  private forceKick(color: Color) {
    const initialPlayingPlayers = this.getPlayingPlayers();
    const kickedPlayerIndex = initialPlayingPlayers.findIndex(player => player.color === color) ?? 0;
    const isPlaying = initialPlayingPlayers[kickedPlayerIndex]?.isPlaying;

    this.players = this.players.filter(player => player.color !== color);
    this.resetHasNotLeftPlayers();

    if (!isPlaying || !this.isGameInProgress()) {
      return;
    }

    const playingPlayers = this.getPlayingPlayers();

    if (playingPlayers.length < PLAYERS_MIN_COUNT) {
      this.stop();
      return;
    }

    if (this.status === STATUSES.LEAD_CHOOSES_CARD || this.status === STATUSES.OTHER_PLAYERS_CHOOSE_CARD || this.status === STATUSES.OTHER_PLAYERS_VOTE) {
      if (this.status === STATUSES.OTHER_PLAYERS_VOTE && this.availableCards.length < playingPlayers.length) {
        this.status = STATUSES.GAME_RESULTS;
        return;
      }

      if (this.lead?.color === color) {
        const newLead = playingPlayers[kickedPlayerIndex];
        this.lead = {
          id: newLead.id,
          color: newLead.color,
        };
      }

      this.players = this.players.map(player => {
        if (!player.isPlaying) {
          return player;
        }

        const playerCard =
          this.status === STATUSES.OTHER_PLAYERS_VOTE ?
            this.availableCards.shift() :
            this.cards.find(card => card.player.color === player.color);

        return ({
          ...player,
          cards: [...player.cards, ...(playerCard ? [{ id: playerCard.id }] : [])],
          isAwaiting: this.lead?.color === player.color,
        });
      });

      this.cards = [];
      this.leadCardDescription = null;
      this.status = STATUSES.ROUND_CANCELED;

      return;
    }
  }

  kick(color: Color): boolean {
    if (this.players.find(player => player.color === color)?.isLeft) {
      this.forceKick(color);
      return true;
    }
    return false;
  }

  leave(color: Color, isForever = false): void {
    if (isForever) {
      this.forceKick(color);
    } else {
      const existingPlayer = this.players.find(player => player.color === color);
      if (existingPlayer) {
        existingPlayer.isLeft = true;
        this.hasLeftPlayers = true;
      }
    }

    if (this.status === STATUSES.GAME_NOT_STARTED && this.players.length < PLAYERS_MIN_COUNT) {
      this.status = STATUSES.WAITING_FOR_PLAYERS;
    }
  }

  start(): boolean {
    if (this.hasLeftPlayers || this.isGameInProgress()) {
      return false;
    }

    this.availableCards = shuffleArray(CARDS);
    this.cards = [];
    this.lead = {
      id: this.players[0].id,
      color: this.players[0].color,
    };
    this.leadCardDescription = null;
    this.status = STATUSES.LEAD_CHOOSES_CARD;

    this.players = this.players.map(player => ({
      ...player,
      score: 0,
      cards: this.availableCards.splice(0, PLAYER_CARDS_COUNT),
      isPlaying: true,
      isAwaiting: this.lead?.color === player.color,
    }));

    return true;
  }

  stop(): boolean {
    if (this.hasLeftPlayers || !this.isGameInProgress() || this.status === STATUSES.GAME_RESULTS) {
      return false;
    }

    this.status = STATUSES.GAME_RESULTS;

    return true;
  }

  leadChooseCard(color: Color, cardId: Card['id'], cardDescription: string): boolean {
    if (this.hasLeftPlayers || this.status !== STATUSES.LEAD_CHOOSES_CARD || color !== this.lead?.color) {
      return false;
    }

    const player = this.players.find(player => player.color === color);
    const playerCard = player?.cards.find(card => card.id === cardId);
    if (!player || !player.isPlaying || !playerCard || !cardDescription) {
      return false;
    }

    this.leadCardDescription = cardDescription;
    this.cards = [{
      ...playerCard,
      player: {
        id: player.id,
        color: player.color,
      },
      selectedBy: [],
    }];
    this.players = this.players.map(player => {
      if (!player.isPlaying) {
        return player;
      }

      if (color === player.color) {
        return ({
          ...player,
          cards: player.cards.filter(card => card.id !== cardId),
          isAwaiting: false,
        });
      }

      return ({
        ...player,
        isAwaiting: true,
      });
    });
    this.status = STATUSES.OTHER_PLAYERS_CHOOSE_CARD;

    return true;
  }

  otherPlayerChooseCard(color: Color, cardId: Card['id']): boolean {
    if (this.hasLeftPlayers || this.status !== STATUSES.OTHER_PLAYERS_CHOOSE_CARD || color === this.lead?.color) {
      return false;
    }

    const player = this.players.find(player => player.color === color);
    const playerCard = player?.cards.find(card => card.id === cardId);
    if (!player || !player.isPlaying || !player.isAwaiting || !playerCard) {
      return false;
    }

    this.cards = [...this.cards, {
      ...playerCard,
      player: {
        id: player.id,
        color: player.color,
      },
      selectedBy: [],
    }];
    this.players = this.players.map(player => {
      if (color === player.color) {
        return ({
          ...player,
          cards: player.cards.filter(card => card.id !== cardId),
          isAwaiting: false,
        });
      }

      return player;
    });

    if (!this.players.some(player => player.isAwaiting)) {
      this.cards = shuffleArray(this.cards);
      this.status = STATUSES.OTHER_PLAYERS_VOTE;

      this.players = this.players.map(player => {
        if (this.lead?.color === player.color || !player.isPlaying) {
          return player;
        }

        return ({
          ...player,
          isAwaiting: true,
        });
      });
    }

    return true;
  }

  otherPlayerVote(color: Color, cardId: Card['id']): boolean {
    if (this.hasLeftPlayers || this.status !== STATUSES.OTHER_PLAYERS_VOTE || color === this.lead?.color) {
      return false;
    }

    const player = this.players.find(player => player.color === color);
    const card = this.cards.find(card => card.id === cardId);
    if (!player || !player.isPlaying || !player.isAwaiting || !card || card.player.color === player.color) {
      return false;
    }

    card.selectedBy = [...card.selectedBy, {
      id: player.id,
      color: player.color,
    }];
    this.players = this.players.map(player => {
      if (color === player.color) {
        return ({
          ...player,
          isAwaiting: false,
        });
      }

      return player;
    });

    if (!this.players.some(player => player.isAwaiting)) {
      if (this.availableCards.length < this.getPlayingPlayers().length) {
        this.status = STATUSES.GAME_RESULTS;
      } else {
        this.status = STATUSES.ROUND_RESULTS;
      }
      const leadCard = this.cards.find(card => card.player.color === this.lead?.color);
      const isAllVotedForLeadCard = leadCard?.selectedBy.length === this.getPlayingPlayers().length - 1;
      const isNobodyVotedForLeadCard = !leadCard?.selectedBy.length;

      this.players = this.players.map(player => {
        if (!player.isPlaying) {
          return player;
        }

        if (this.lead?.color === player.color) {
          return {
            ...player,
            score: player.score + (isAllVotedForLeadCard || isNobodyVotedForLeadCard ? 0 : 3),
          };
        }

        const playerCard = this.cards.find(card => card.player.color === player.color);
        const playerCardVotesCount = playerCard?.selectedBy.length ?? 0;
        const isPlayerVotedForLeadCard = leadCard?.selectedBy.find(selectedByPlayer => selectedByPlayer.color === player.color);

        return ({
          ...player,
          score: player.score + (isAllVotedForLeadCard || isNobodyVotedForLeadCard ? 2 : isPlayerVotedForLeadCard ? 3 : 0) + playerCardVotesCount,
          isAwaiting: false,
        });
      });
    }

    return true;
  }

  startNextRound(color: Color): boolean {
    if (this.hasLeftPlayers || (this.status !== STATUSES.ROUND_RESULTS && this.status !== STATUSES.ROUND_CANCELED)) {
      return false;
    }

    const player = this.players.find(player => player.color === color);
    if (!player?.isPlaying) {
      return false;
    }

    if (this.status === STATUSES.ROUND_CANCELED) {
      this.status = STATUSES.LEAD_CHOOSES_CARD;
      return true;
    }

    const playingPlayers = this.getPlayingPlayers();
    if (this.availableCards.length < playingPlayers.length) {
      this.status = STATUSES.GAME_RESULTS;
      return true;
    }

    this.cards = [];
    const previousLeadIndex = playingPlayers.findIndex(player => player.color === this.lead?.color) ?? playingPlayers.length - 1;
    const newLead = playingPlayers[previousLeadIndex >= playingPlayers.length - 1 ? 0 : previousLeadIndex + 1];
    this.lead = {
      id: newLead.id,
      color: newLead.color,
    };
    this.leadCardDescription = null;
    this.status = STATUSES.LEAD_CHOOSES_CARD;

    this.players = this.players.map(player => {
      if (!player.isPlaying) {
        return player;
      }

      return ({
        ...player,
        cards: [...player.cards, this.availableCards.shift() as Card],
        isAwaiting: this.lead?.color === player.color,
      });
    });

    return true;
  }

  getStateForPlayers(): State {
    const room = {
      name: this.name,
      hasLeftPlayers: this.hasLeftPlayers,
      status: this.status,
      players: this.players.map(player => ({
        id: player.id,
        color: player.color,
        score: player.score,
        isPlaying: player.isPlaying,
        isLeft: player.isLeft,
        isAwaiting: player.isAwaiting,
      })),
      lead: this.lead,
      leadCardDescription: this.leadCardDescription,
    };
    const isCardsVisible = this.status === STATUSES.ROUND_RESULTS || this.status === STATUSES.GAME_RESULTS;
    return this.getNotLeftPlayers().reduce((state, player) => {
      state[player.id] = {
        room: {
          ...room,
          cards: this.cards.map((card): PublicCard => ({
            id: isCardsVisible || this.status === STATUSES.OTHER_PLAYERS_VOTE ? card.id : 'hidden',
            player: isCardsVisible ? card.player : null,
            isMyCard: card.player.color === player.color,
            selectedBy: isCardsVisible ? card.selectedBy : null,
          })),
        },
        me: {
          id: player.id,
          color: player.color,
          cards: player.cards,
          isPlaying: player.isPlaying,
          isLeft: player.isLeft,
          isAwaiting: player.isAwaiting,
        }
      };

      return state;
    }, {} as State);
  }
}
