import { IncomingMessageType } from '@app/messaging/enums';
import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';

export interface IListRoomUsersIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.LIST_ROOM_USERS> {
  room: string;
}
