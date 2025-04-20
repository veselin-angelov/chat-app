import { OutgoingMessageType } from '@app/enums';
import { IBaseOutgoingMessage } from './base-outgoing-message.interface';
import { MessageInfo } from '@app/types/message-info.type';

export interface IDirectHistoryOutgoingMessage extends IBaseOutgoingMessage {
  type: OutgoingMessageType.DIRECT_HISTORY;
  userId: string; // The ID of the other user in the conversation
  messages: MessageInfo[];
}
