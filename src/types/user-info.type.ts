import { WebSocket } from 'ws';

export type UserInfo = {
  id: string;
  username: string;
  socket: WebSocket;
  rooms: Set<string>;
};
