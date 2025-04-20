import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/enums';
import { RoomInfo } from '@app/types';

export interface IRoomsListOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ROOMS_LIST> {
  rooms: Pick<RoomInfo, 'id' | 'name'>[]; // TODO: fix
}
