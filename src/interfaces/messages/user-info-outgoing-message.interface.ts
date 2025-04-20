import { OutgoingMessageType } from '@app/enums';
import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';

export interface IUserInfoOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.USER_CONNECTED> {
  user?: {
    id: string;
    username: string;
  };
}
