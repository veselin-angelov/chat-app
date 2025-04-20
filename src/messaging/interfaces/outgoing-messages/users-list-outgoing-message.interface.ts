import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';

export interface IUsersListOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.USERS_LIST> {
  users: Pick<UserInfo, 'id' | 'username'>[]; // TODO: fix this if needed
}
