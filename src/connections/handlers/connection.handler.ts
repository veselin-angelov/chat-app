import { WebSocket } from 'ws';
import { usersService } from '@app/services';
import { errorHandler } from '@app/connections/handlers/error.handler';
import { messageHandler } from '@app/messaging/handlers';
import { closeHandler } from '@app/connections/handlers/close.handler';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { IUserConnectedOutgoingMessage } from '@app/messaging/interfaces';

/**
 * Handler for new WebSocket connections
 * Creates a new user and sets up event handlers
 */
export const connectionHandler = (socket: WebSocket) => {
  // Create a new user with the users service
  const currentUser = usersService.createUser(socket);

  console.log(`Client connected: ${currentUser.id} ${currentUser.username}`);

  // Send the user info to the client
  // TODO: maybe ping the client with the data instead?
  sendSafe<IUserConnectedOutgoingMessage>(socket, {
    id: null as any, // not respoinding to any message yet, so don't have an id to respond with
    type: OutgoingMessageType.USER_CONNECTED,
    user: {
      id: currentUser.id,
      username: currentUser.username,
    },
  });

  // Set up event handlers for the socket
  socket.on('error', errorHandler);
  socket.on('message', messageHandler(socket, currentUser));
  socket.on('close', closeHandler(currentUser.id));
};
