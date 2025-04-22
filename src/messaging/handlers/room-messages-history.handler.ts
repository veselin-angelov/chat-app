import {
  IFetchRoomMessagesHistoryIncomingMessage,
  IMessageHandler,
  IRoomMessagesHistoryOutgoingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { IMessageService } from '@app/messaging/interfaces/message-service.interface';
import { IRoomService } from '@app/rooms/interfaces';
import { WebSocket } from 'ws';

export class RoomMessagesHistoryHandler
  implements IMessageHandler<IFetchRoomMessagesHistoryIncomingMessage>
{
  public readonly messageType = IncomingMessageType.FETCH_ROOM_MESSAGES_HISTORY;

  constructor(
    private readonly roomService: IRoomService,
    private readonly messageService: IMessageService,
  ) {}

  public async handle(
    socket: WebSocket,
    message: IFetchRoomMessagesHistoryIncomingMessage,
  ): Promise<void> {
    const room = this.roomService.getRoom(message.room);

    if (!room) {
      throw new Error(`Room ${message.room} not found`);
    }

    const roomHistory = this.messageService.getRoomMessageHistory(message.room);

    // Send room history to the user
    return sendSafe<IRoomMessagesHistoryOutgoingMessage>(socket, {
      id: message.id,
      type: OutgoingMessageType.ROOM_MESSAGES_HISTORY,
      room: message.room,
      messages: roomHistory,
    });
  }
}
