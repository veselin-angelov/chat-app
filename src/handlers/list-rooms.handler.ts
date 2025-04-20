import { sendSafe } from '@app/helpers';
import {
  IListRoomsIncomingMessage,
  IRoomsListOutgoingMessage,
} from '@app/interfaces/messages';
import { OutgoingMessageType } from '@app/enums';
import { MessageHandler } from '@app/types';
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
