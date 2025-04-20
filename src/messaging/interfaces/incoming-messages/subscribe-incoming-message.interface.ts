import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/messaging/enums';

export interface ISubscribeIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.SUBSCRIBE> {
  room: string;
}
