import { OutgoingMessageType } from '@app/messaging/enums';
import {
  IErrorOutgoingMessage,
  IListRoomUsersIncomingMessage,
  IRoomUsersListOutgoingMessage,
} from '@app/messaging/interfaces';
import { MessageHandler } from '@app/messaging/types';
import { roomService } from '@app/services';
import { sendSafe } from '@app/messaging/helpers';

export const listRoomUsersHandler: MessageHandler<
  IListRoomUsersIncomingMessage
> = (socket, data) => {
  const room = roomService.getRoom(data.room);

  if (!room) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Room ${data.room} not found`,
    });
  }

  const roomUsers = roomService.getRoomUsers(room.id);

  const users = roomUsers.map((user) => ({
    id: user.id,
    username: user.username,
  }));

  return sendSafe<IRoomUsersListOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ROOM_USERS_LIST,
    room: room.id,
    users: users,
  });
};
