import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';

export interface IDirectMessageOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.DIRECT_MESSAGE> {
  from: Pick<UserInfo, 'id' | 'username'>;
  message: string;
}
