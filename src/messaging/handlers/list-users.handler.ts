import { OutgoingMessageType } from '@app/messaging/enums';
import {
  IListUsersIncomingMessage,
  IUsersListOutgoingMessage,
} from '@app/messaging/interfaces';
import { MessageHandler } from '@app/messaging/types';
import { usersService } from '@app/services';
import { sendSafe } from '@app/messaging/helpers';

export const listUsersHandler: MessageHandler<IListUsersIncomingMessage> = (
  socket,
  data,
) => {
  const allUsers = usersService.getAllUsers();

  const users = allUsers.map((user) => ({
    id: user.id,
    username: user.username,
  }));

  return sendSafe<IUsersListOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.USERS_LIST,
    users: users,
  });
};
