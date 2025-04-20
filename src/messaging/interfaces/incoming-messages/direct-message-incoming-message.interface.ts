import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/messaging/enums';

export interface IDirectMessageIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.SEND_DIRECT_MESSAGE> {
  userId: string;
  message: string;
}
