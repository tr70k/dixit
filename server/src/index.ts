import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import * as http from 'http';
import ShortUniqueId from 'short-unique-id';
import { Card, Color, PlayerState, Room } from './room';
import { getPlayerName } from './palyer';

dotenv.config();

const uid = new ShortUniqueId();
const UID_LENGTH = 6;

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
  startNextRound: () => void
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const app: Express = express();
const port = process.env.PORT;

app.use(cors({
  origin: process.env.CLIENT_URL,
}));

const server = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
  >(server, {
    path: '/api',
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

const rooms: Record<string, Room> = {};

type MessageToAll = {
  message: string,
  variant?: 'success' | 'info' | 'error' | 'warning'
};

const emitState = (room: Room, messageToAll?: MessageToAll) => {
  Object.entries(room.getStateForPlayers()).forEach(([playerId, playerState]) => {
    io.to(`${room.getName()}/${playerId}`).emit('state', playerState);
    if (messageToAll) {
      io.to(`${room.getName()}/${playerId}`).emit('message', messageToAll.message, messageToAll.variant);
    }
  });
};

type Player = {
  id: string,
  color: Color,
  room: Room,
};

const getPlayerSocketName = (player: Player) => `${player.room.getName()}/${player.id}`;

io.on('connection', (socket) => {
  const socketId = socket.id;
  let player: Player | null = null;

  console.log(`connection / socketId: ${socketId} /`);

  socket.on('create', ({ player: id }) => {
    let name = uid.randomUUID(UID_LENGTH);
    while (rooms[name]) {
      name = uid.randomUUID(UID_LENGTH);
    }
    rooms[name] = new Room(name);

    const color = rooms[name].join(id);

    if (color) {
      player = {
        id,
        color,
        room: rooms[name],
      };

      socket.join(getPlayerSocketName(player));
      emitState(player.room, { message: 'Room created', variant: 'success' });
    } else {
      socket.emit('message', 'Failed to create room', 'error');
    }

    console.log(`create / socketId: ${socketId} / color: ${color}, room: `, player?.room);
  });

  socket.on('join', ({ player: id, room: name }) => {
    if (!rooms[name]) {
      socket.emit('message', `Room #${name} doesn't exists`, 'error');
      return;
    }

    const color = rooms[name].join(id);

    if (color) {
      player = {
        id,
        color,
        room: rooms[name],
      };

      socket.join(getPlayerSocketName(player));
      emitState(player.room, { message: `${getPlayerName(player)} joined`, variant: 'success' });
    } else {
      socket.emit('message', 'Failed to join room', 'error');
    }

    console.log(`join / socketId: ${socketId} / color: ${color}, room: `, player?.room);
  });

  socket.on('leave', () => {
    console.log(`leave / socketId: ${socketId} / color: ${player?.color}, room: `, player?.room);

    if (player) {
      socket.leave(getPlayerSocketName(player));
      player.room.leave(player.color, true);

      if (player.room.isEmpty()) {
        delete rooms[player.room.getName()];
      } else {
        emitState(player.room, { message: `${getPlayerName(player)} left`, variant: 'error' });
      }
      player = null;
    }
  });

  socket.on('kick', ({ color }) => {
    if (player) {
      const kicked = player.room.kick(color);
      if (kicked) {
        emitState(player.room, { message: `${getPlayerName(player)} kicked somebody`, variant: 'error' });
      }
    }
  });

  socket.on('start', () => {
    if (player) {
      const started = player.room.start();
      if (started) {
        emitState(player.room, { message: `${getPlayerName(player)} started the game`, variant: 'success' });
      }
    }
  });

  socket.on('stop', () => {
    if (player) {
      const stopped = player.room.stop();
      if (stopped) {
        emitState(player.room, { message: `${getPlayerName(player)} stopped the game`, variant: 'error' });
      }
    }
  });

  socket.on('leadChooseCard', ({ cardId, cardDescription }) => {
    if (player) {
      const leadChoseCard = player.room.leadChooseCard(player.color, cardId, cardDescription);
      if (leadChoseCard) {
        emitState(player.room);
      }
    }
  });

  socket.on('otherPlayerChooseCard', ({ cardId }) => {
    if (player) {
      const otherPlayerChoseCard = player.room.otherPlayerChooseCard(player.color, cardId);
      if (otherPlayerChoseCard) {
        emitState(player.room);
      }
    }
  });

  socket.on('otherPlayerVote', ({ cardId }) => {
    if (player) {
      const otherPlayerVoted = player.room.otherPlayerVote(player.color, cardId);
      if (otherPlayerVoted) {
        emitState(player.room);
      }
    }
  });

  socket.on('startNextRound', () => {
    if (player) {
      const nextRoundStarted = player.room.startNextRound(player.color);
      if (nextRoundStarted) {
        emitState(player.room, { message: `${getPlayerName(player)} started the next round`, variant: 'success' });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`disconnect / socketId: ${socketId} / color: ${player?.color}, room: `, player?.room);

    if (player) {
      socket.leave(getPlayerSocketName(player));

      const lostConnection = !io.sockets.adapter.rooms.get(getPlayerSocketName(player))?.size;

      if (lostConnection) {
        player.room.leave(player.color);

        if (player.room.isEmpty()) {
          delete rooms[player.room.getName()];
        } else {
          emitState(player.room, { message: `${getPlayerName(player)} disconnected`, variant: 'error' });
        }

        player = null;
      }
    }
  });
});

app.get('/api/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
