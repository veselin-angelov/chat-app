import { OutgoingMessageType } from '@app/messaging/enums';
import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { UserInfo } from '@app/users/types';

export interface IUserConnectedOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.USER_CONNECTED> {
  user?: Pick<UserInfo, 'id' | 'username'>;
}
