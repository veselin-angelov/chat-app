import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/enums';

export interface IGetDirectHistoryIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.GET_DIRECT_HISTORY> {
  userId: string; // The ID of the user to get history with
  limit?: number; // Optional limit on number of messages
}
