import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';
import { IncomingMessageType } from '@app/messaging/enums';

export interface IFetchDirectMessageHistoryIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.FETCH_DIRECT_MESSAGE_HISTORY> {
  userId: string; // The ID of the user to get history with
}
