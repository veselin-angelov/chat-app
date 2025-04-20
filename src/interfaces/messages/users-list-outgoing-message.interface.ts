import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/enums';
import { UserInfo } from '@app/types';

export interface IUsersListOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.USERS_LIST> {
  room: string;
  users: Pick<UserInfo, 'id' | 'username'>[]; // TODO: fix this if needed
}
