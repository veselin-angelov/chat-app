import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/enums';

export interface ISendMessageIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.SEND_MESSAGE> {
  room: string;
  message: string;
}
