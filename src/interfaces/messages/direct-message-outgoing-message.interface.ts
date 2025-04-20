import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/enums';
import { UserInfo } from '@app/types';

export interface IDirectMessageOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.DIRECT_MESSAGE> {
  from: Pick<UserInfo, 'id' | 'username'>;
  message: string;
}
