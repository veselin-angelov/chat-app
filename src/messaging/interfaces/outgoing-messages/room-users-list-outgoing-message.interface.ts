import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';

export interface IRoomUsersListOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ROOM_USERS_LIST> {
  room: string;
  users: Pick<UserInfo, 'id' | 'username'>[];
}
