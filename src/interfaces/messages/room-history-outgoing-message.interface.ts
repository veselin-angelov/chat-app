import { OutgoingMessageType } from '@app/enums';
import { IBaseOutgoingMessage } from './base-outgoing-message.interface';
import { MessageInfo } from '@app/types/message-info.type';

export interface IRoomHistoryOutgoingMessage extends IBaseOutgoingMessage {
  type: OutgoingMessageType.ROOM_HISTORY;
  room: string;
  messages: MessageInfo[];
}
