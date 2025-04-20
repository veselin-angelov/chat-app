import { IncomingMessageType } from '@app/messaging/enums';
import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';

export interface IFetchRoomMessagesHistoryIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.FETCH_ROOM_MESSAGES_HISTORY> {
  room: string;
}
