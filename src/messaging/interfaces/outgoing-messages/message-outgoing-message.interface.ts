import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';

export interface IMessageOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ROOM_MESSAGE> {
  room: string;
  from: Pick<UserInfo, 'id' | 'username'>; // TODO: maybe fix
  message: string;
}
