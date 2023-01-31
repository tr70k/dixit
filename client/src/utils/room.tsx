import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:4000';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

// todo

type Room = {
  name: string
}

type Context = {
  room: Room | null,
  join: (name: string) => Promise<void>,
  leave: () => Promise<void>
}

export const RoomContext = createContext<Context>({
  room: null,
  join: async () => void 0,
  leave: async () => void 0,
});

export type RoomProviderProps = {
  // roomName?: string
  children?: ReactNode
}

export const RoomProvider = (props: RoomProviderProps) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useRef(io(API_URL, {
    autoConnect: false,
  })).current;
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket connected: ', socket.connected); // true
    });

    socket.on('disconnect', () => {
      console.log('socket connected: ', socket.connected); // false
    });

    // socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  async function join(name: string): Promise<void> {
    console.log('join mock');
  }

  async function leave(): Promise<void> {
    console.log('leave mock');
  }

  return (
    <RoomContext.Provider
      value={{
        room: roomData,
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
