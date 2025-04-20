import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/enums';

export interface ISubscribeIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.SUBSCRIBE> {
  room: string;
}
