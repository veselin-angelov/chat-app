import { OutgoingMessageType } from '@app/messaging/enums';
import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { MessageInfo } from '@app/messaging/types';

export interface IDirectMessagesHistoryOutgoingMessage
  extends IBaseOutgoingMessage {
  type: OutgoingMessageType.DIRECT_MESSAGES_HISTORY;
  userId: string; // The ID of the other user in the conversation
  messages: MessageInfo[];
}
