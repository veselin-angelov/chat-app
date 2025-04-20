import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/enums';

export interface IUnsubscribeIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.UNSUBSCRIBE> {
  room: string;
}
