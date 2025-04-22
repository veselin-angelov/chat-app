import {
  IAcknowledgeOutgoingMessage,
  IMessageHandler,
  ISubscribeIncomingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { IRoomService } from '@app/rooms/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { UserInfo } from '@app/users/types';
import { WebSocket } from 'ws';

export class SubscribeHandler
  implements IMessageHandler<ISubscribeIncomingMessage>
{
  public readonly messageType = IncomingMessageType.SUBSCRIBE;

  constructor(
    private readonly roomService: IRoomService,
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  public async handle(
    socket: WebSocket,
    message: ISubscribeIncomingMessage,
    currentUser: UserInfo,
  ): Promise<void> {
    const room = this.roomService.getRoom(message.room);

    if (!room) {
      throw new Error(`Room ${message.room} not found`);
    }

    // Use the subscription service to handle the bidirectional relationship
    const subscribed = this.subscriptionService.subscribeUserToRoom(
      currentUser.id,
      message.room,
    );

    if (!subscribed) {
      throw new Error(`Failed to subscribe to room ${message.room}`);
    }

    return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.ACK,
      message: 'Subscribed',
    });
  }
}
