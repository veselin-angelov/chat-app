import { IncomingMessageType } from '@app/messaging/enums';
import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages/base-incoming-message.interface';

export interface IListRoomsIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.LIST_ROOMS> {}
