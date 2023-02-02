import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import * as http from 'http';
import { Color, PlayerState, Room } from './room';

dotenv.config();

interface ServerToClientEvents {
  state: (state: PlayerState) => void;
}

interface ClientToServerEvents {
  join: (data: { player: string, room: string }) => void;
  leave: () => void;
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

app.use(cors());

const server = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
  >(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

const rooms: Record<string, Room> = {};

io.on('connection', (socket) => {
  const socketId = socket.id;
  let color: Color | null = null;
  let room: Room | null = null;

  console.log(`connection / socketId: ${socketId} /`);

  socket.on('join', ({ player: id, room: name }) => {
    if (!rooms[name]) {
      rooms[name] = new Room(name);
    }

    color = rooms[name].join({ id, socketId });

    if (color) {
      room = rooms[name];
      console.log('room.getStateForPlayers()', Object.keys(room.getStateForPlayers()));
      Object.entries(room.getStateForPlayers()).forEach(([playerSocketId, playerState]) => {
        io.sockets.sockets.get(playerSocketId)?.emit('state', playerState);
      });
    }

    console.log(`join / socketId: ${socketId} / color: ${color}, room: `, room);
  });

  socket.on('leave', () => {
    if (color && room) {
      room.leave(color, true);

      if (room.isEmpty()) {
        delete rooms[room.getName()];
        room = null;
      } else {
        Object.entries(room.getStateForPlayers()).forEach(([playerSocketId, playerState]) => {
          io.sockets.sockets.get(playerSocketId)?.emit('state', playerState);
        });
      }
    }

    console.log(`disconnect / socketId: ${socketId} / color: ${color}, room: `, room);
  });

  socket.on('disconnect', () => {
    if (color && room) {
      room.leave(color);

      Object.entries(room.getStateForPlayers()).forEach(([playerSocketId, playerState]) => {
        io.sockets.sockets.get(playerSocketId)?.emit('state', playerState);
      });
    }

    console.log(`disconnect / socketId: ${socketId} / color: ${color}, room: `, room);
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
