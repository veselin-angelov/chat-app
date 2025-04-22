import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/messaging/enums';
import { RoomInfo } from '@app/rooms/types';

export interface IRoomsListOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ROOMS_LIST> {
  rooms: Pick<RoomInfo, 'id' | 'name'>[];
}
