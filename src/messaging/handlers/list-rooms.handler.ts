import { sendSafe } from '@app/messaging/helpers';
import {
  IListRoomsIncomingMessage,
  IRoomsListOutgoingMessage,
} from '@app/messaging/interfaces';
import { OutgoingMessageType } from '@app/messaging/enums';
import { MessageHandler } from '@app/messaging/types';
import { roomService } from '@app/services';

export const listRoomsHandler: MessageHandler<IListRoomsIncomingMessage> = (
  socket,
  data,
) => {
  const rooms = roomService.getAllRooms().map((room) => ({
    id: room.id,
    name: room.name,
  }));

  return sendSafe<IRoomsListOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ROOMS_LIST,
    rooms: rooms,
  });
};
