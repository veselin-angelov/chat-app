import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/messaging/enums';

export interface IUnsubscribeIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.UNSUBSCRIBE> {
  room: string;
}
