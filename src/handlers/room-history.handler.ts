import { WebSocket } from 'ws';
import {
  IErrorOutgoingMessage,
  IGetHistoryIncomingMessage,
  IRoomHistoryOutgoingMessage,
} from '@app/interfaces/messages';
import { sendSafe } from '@app/helpers';
import { OutgoingMessageType } from '@app/enums';
import { messageService, roomService } from '@app/services';
import { UserInfo } from '@app/types';
/**
 * Handler for sending room message history to a client
 */
export const roomHistoryHandler = (
  socket: WebSocket,
  data: IGetHistoryIncomingMessage,
  currentUser: UserInfo,
) => {
  // Validate the room exists
  const room = roomService.getRoom(data.room);

  if (!room) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Room ${data.room} not found`,
    });
  }

  // Get room history (last 50 messages)
  const roomHistory = messageService.getRoomMessageHistory(data.room, 50);

  // Send room history to the user
  sendSafe<IRoomHistoryOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ROOM_HISTORY,
    room: data.room,
    messages: roomHistory,
  });
};
