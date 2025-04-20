import { IBaseOutgoingMessage } from '@app/interfaces/messages';
import { WebSocket } from 'ws';

export const sendSafe = <T extends IBaseOutgoingMessage>(
  socket: WebSocket,
  msg: T,
) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error(`Something is wrong with socket`);
  }

  socket.send(JSON.stringify(msg));
};
