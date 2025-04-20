import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/enums';

export interface IDirectMessageIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.DIRECT_MESSAGE> {
  to: string; // user ID of recipient
  message: string;
}
