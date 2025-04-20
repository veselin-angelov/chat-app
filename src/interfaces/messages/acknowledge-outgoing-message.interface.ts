import { OutgoingMessageType } from '@app/enums';
import { IBaseOutgoingMessage } from '@app/interfaces/messages/base-outgoing-message.interface';

export interface IAcknowledgeOutgoingMessage
  extends IBaseOutgoingMessage<OutgoingMessageType.ACK> {
  message?: string;
}
