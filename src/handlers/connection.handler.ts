import { WebSocket } from 'ws';
import { usersService } from '@app/services';
import { errorHandler } from '@app/handlers/error.handler';
import { messageHandler } from '@app/handlers/message.handler';
import { closeHandler } from '@app/handlers/close.handler';
import { IUserInfoOutgoingMessage } from '@app/interfaces/messages';
import { sendSafe } from '@app/helpers';
import { OutgoingMessageType } from '@app/enums';

/**
 * Handler for new WebSocket connections
 * Creates a new user and sets up event handlers
 */
export const connectionHandler = (socket: WebSocket) => {
  // Create a new user with the users service
  const currentUser = usersService.createUser(socket);

  console.log(`Client connected: ${currentUser.id} ${currentUser.username}`);

  // Send the user info to the client
  sendSafe<IUserInfoOutgoingMessage>(socket, {
    id: 'connection',
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
