import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import {
  IListUsersIncomingMessage,
  IMessageHandler,
  IUsersListOutgoingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IUserService } from '@app/users/interfaces';
import { WebSocket } from 'ws';

export class ListUsersHandler
  implements IMessageHandler<IListUsersIncomingMessage>
{
  public readonly messageType = IncomingMessageType.LIST_USERS;

  constructor(private readonly usersService: IUserService) {}

  public async handle(
    socket: WebSocket,
    message: IListUsersIncomingMessage,
  ): Promise<void> {
    const allUsers = this.usersService.getAllUsers();

    const users = allUsers.map((user) => ({
      id: user.id,
      username: user.username,
    }));

    return sendSafe<IUsersListOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.USERS_LIST,
      users: users,
    });
  }
}
