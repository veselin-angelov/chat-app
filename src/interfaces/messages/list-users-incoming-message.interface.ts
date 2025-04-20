import { IncomingMessageType } from '@app/enums';
import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';

export interface IListUsersIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.LIST_USERS> {
  room: string;
}
