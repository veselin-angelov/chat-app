import { OutgoingMessageType } from '@app/messaging/enums';
import { IBaseOutgoingMessage } from '@app/messaging/interfaces/outgoing-messages/base-outgoing-message.interface';
import { MessageInfo } from '@app/messaging/types';

export interface IRoomMessagesHistoryOutgoingMessage
  extends IBaseOutgoingMessage {
  type: OutgoingMessageType.ROOM_MESSAGES_HISTORY;
  room: string;
  messages: MessageInfo[];
}
