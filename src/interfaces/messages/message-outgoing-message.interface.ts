import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/enums';
import { UserInfo } from '@app/types';

export interface IMessageOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.MESSAGE> {
  room: string;
  from: Pick<UserInfo, 'id' | 'username'>; // TODO: maybe fix
  message: string;
}
