import { WebSocketServer } from 'ws';
import { usersStorage } from '@app/storage/memory';
import { initializeServices } from '@app/services';
import { roomsStorage } from '@app/storage/memory';
import { messagesStorage } from '@app/storage/memory';
import { connectionHandler } from '@app/connections/handlers/connection.handler';

/**
 * Initialize the application
 */
export const initializeApp = () => {
  console.log('Initializing application...');

  // Initialize services with storage implementations
  initializeServices(usersStorage, roomsStorage, messagesStorage);

  // Create and start a WebSocket server
  const wss = new WebSocketServer({ port: 8080 });
  console.log('WebSocket server started on port 8080');

  // Set up a connection handler
  wss.on('connection', connectionHandler);

  return wss;
};
