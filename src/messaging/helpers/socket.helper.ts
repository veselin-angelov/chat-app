import { WebSocket } from 'ws';
import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages';

/**
 * Safely sends a message through a WebSocket
 * @param socket WebSocket to send through
 * @param data Data to send
 */
export function sendSafe<T extends IBaseOutgoingMessage>(socket: WebSocket, data: T): void {
  try {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
  }
}
