import { OutgoingMessageType } from '@app/messaging/enums';
import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';

export interface IAcknowledgeOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ACK> {
  message?: string;
}
