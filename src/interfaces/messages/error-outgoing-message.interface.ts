import { OutgoingMessageType } from '@app/enums';
import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';

export interface IErrorOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ERROR> {
  message: string;
}
