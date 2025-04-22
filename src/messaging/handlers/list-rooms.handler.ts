import { sendSafe } from '@app/messaging/helpers';
import {
  IListRoomsIncomingMessage,
  IMessageHandler,
  IRoomsListOutgoingMessage,
} from '@app/messaging/interfaces';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { IRoomService } from '@app/rooms/interfaces';
import { WebSocket } from 'ws';

export class ListRoomsHandler
  implements IMessageHandler<IListRoomsIncomingMessage>
{
  public readonly messageType = IncomingMessageType.LIST_ROOMS;

  constructor(private readonly roomService: IRoomService) {}

  public async handle(
    socket: WebSocket,
    message: IListRoomsIncomingMessage,
  ): Promise<void> {
    const rooms = this.roomService.getAllRooms().map((room) => ({
      id: room.id,
      name: room.name,
    }));

    return sendSafe<IRoomsListOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.ROOMS_LIST,
      rooms: rooms,
    });
  }
}
