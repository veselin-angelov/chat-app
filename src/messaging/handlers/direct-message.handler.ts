import {
  IAcknowledgeOutgoingMessage,
  IDirectMessageIncomingMessage,
  IMessageHandler,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { IMessageService } from '@app/messaging/interfaces/message-service.interface';
import { IUserService } from '@app/users/interfaces';
import { UserInfo } from '@app/users/types';
import { WebSocket } from 'ws';

export class DirectMessageHandler
  implements IMessageHandler<IDirectMessageIncomingMessage>
{
  public readonly messageType = IncomingMessageType.SEND_DIRECT_MESSAGE;

  constructor(
    private readonly usersService: IUserService,
    private readonly messageService: IMessageService,
  ) {}

  public async handle(
    socket: WebSocket,
    message: IDirectMessageIncomingMessage,
    currentUser: UserInfo,
  ): Promise<void> {
    const targetUser = this.usersService.getUser(message.userId);

    if (!targetUser) {
      throw new Error(`User ${message.userId} not found`);
    }

    // Check if target user is connected
    if (!targetUser.socket) {
      throw new Error(`User ${targetUser.username} is offline`);
    }

    // Send the direct message to the recipient
    const sent = this.messageService.sendDirectMessage(
      currentUser.id,
      targetUser.id,
      message.message,
    );

    if (!sent) {
      throw new Error('Failed to send message');
    }

    // Send acknowledgment to the sender
    return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.ACK,
      message: 'Direct message sent',
    });
  }
}
