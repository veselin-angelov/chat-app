import { OutgoingMessageType } from '@app/enums';
import {
  IErrorOutgoingMessage,
  IListUsersIncomingMessage,
  IUsersListOutgoingMessage,
} from '@app/interfaces/messages';
import { MessageHandler } from '@app/types';
import { roomService } from '@app/services';
import { sendSafe } from '@app/helpers';

export const listUsersHandler: MessageHandler<IListUsersIncomingMessage> = (
  socket,
  data,
) => {
  // Check if the room exists
  if (!roomService.roomExists(data.room)) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Room ${data.room} not found`,
    });
  }

  // Get users in the room using the room service
  const roomUsers = roomService.getRoomUsers(data.room);

  // Map to the response format
  const users = roomUsers.map((user) => ({
    id: user.id,
    username: user.username,
  }));

  return sendSafe<IUsersListOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.USERS_LIST,
    room: data.room,
    users: users,
  });
};
