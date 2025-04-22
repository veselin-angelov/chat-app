import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import {
  IDirectMessagesHistoryOutgoingMessage,
  IFetchDirectMessageHistoryIncomingMessage,
  IMessageHandler,
} from '@app/messaging/interfaces';
import { IMessageService } from '@app/messaging/interfaces/message-service.interface';
import { IUserService } from '@app/users/interfaces';
import { UserInfo } from '@app/users/types';
import { WebSocket } from 'ws';

export class DirectMessageHistoryHandler
  implements IMessageHandler<IFetchDirectMessageHistoryIncomingMessage>
{
  public readonly messageType =
    IncomingMessageType.FETCH_DIRECT_MESSAGE_HISTORY;

  constructor(
    private readonly usersService: IUserService,
    private readonly messageService: IMessageService,
  ) {}

  public async handle(
    socket: WebSocket,
    message: IFetchDirectMessageHistoryIncomingMessage,
    currentUser: UserInfo,
  ): Promise<void> {
    const targetUser = this.usersService.getUser(message.userId);

    if (!targetUser) {
      throw new Error(`User ${message.userId} not found`);
    }

    const messages = this.messageService.getDirectMessageHistory(
      currentUser.id,
      targetUser.id,
    );

    return sendSafe<IDirectMessagesHistoryOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.DIRECT_MESSAGES_HISTORY,
      userId: targetUser.id,
      messages,
    });
  }
}
