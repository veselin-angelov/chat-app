import {
  IAcknowledgeOutgoingMessage,
  IMessageHandler,
  IUnsubscribeIncomingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';
import { IRoomService } from '@app/rooms/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { WebSocket } from 'ws';

export class UnsubscribeHandler
  implements IMessageHandler<IUnsubscribeIncomingMessage>
{
  public readonly messageType = IncomingMessageType.UNSUBSCRIBE;

  constructor(
    private readonly roomService: IRoomService,
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async handle(
    socket: WebSocket,
    data: IUnsubscribeIncomingMessage,
    currentUser: UserInfo,
  ): Promise<void> {
    const room = this.roomService.getRoom(data.room);

    if (!room) {
      throw new Error(`Room ${data.room} not found`);
    }

    // Use the subscription service to handle the bidirectional relationship
    const unsubscribed = this.subscriptionService.unsubscribeUserFromRoom(
      currentUser.id,
      data.room,
    );

    if (!unsubscribed) {
      throw new Error(`Failed to unsubscribe from room ${data.room}`);
    }

    return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ACK,
      message: 'Unsubscribed',
    });
  }
}
