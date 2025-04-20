import { IncomingMessageType } from '@app/enums';
import { IBaseIncomingMessage } from '@app/interfaces/messages/base-incoming-message.interface';

export interface IListRoomsIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.LIST_ROOMS> {}
