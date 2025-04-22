import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import {
  IListRoomUsersIncomingMessage,
  IMessageHandler,
  IRoomUsersListOutgoingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IRoomService } from '@app/rooms/interfaces';
import { WebSocket } from 'ws';
import { ISubscriptionService } from '@app/subscriptions/interfaces';

export class ListRoomUsersHandler
  implements IMessageHandler<IListRoomUsersIncomingMessage>
{
  public readonly messageType = IncomingMessageType.LIST_ROOM_USERS;

  constructor(
    private readonly roomService: IRoomService,
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  public async handle(
    socket: WebSocket,
    message: IListRoomUsersIncomingMessage,
  ): Promise<void> {
    const room = this.roomService.getRoom(message.room);

    if (!room) {
      throw new Error(`Room ${message.room} not found`);
    }

    const roomUsers = this.subscriptionService.getRoomSubscribers(room.id);

    const users = roomUsers.map((user) => ({
      id: user.id,
      username: user.username,
    }));

    return sendSafe<IRoomUsersListOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.ROOM_USERS_LIST,
      room: room.id,
      users: users,
    });
  }
}
