import {
  IErrorOutgoingMessage,
  IFetchRoomMessagesHistoryIncomingMessage,
  IRoomMessagesHistoryOutgoingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { messageService, roomService } from '@app/services';
import { MessageHandler } from '@app/messaging/types';

/**
 * Handler for sending room message history to a client
 */
export const roomMessagesHistoryHandler: MessageHandler<
  IFetchRoomMessagesHistoryIncomingMessage
> = (socket, data) => {
  const room = roomService.getRoom(data.room);

  // TODO: export to global handler, leave the error throwing to the service and handling to the caller
  if (!room) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Room ${data.room} not found`,
    });
  }

  const roomHistory = messageService.getRoomMessageHistory(data.room);

  // Send room history to the user
  sendSafe<IRoomMessagesHistoryOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ROOM_MESSAGES_HISTORY,
    room: data.room,
    messages: roomHistory,
  });
};
