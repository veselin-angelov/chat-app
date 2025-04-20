import { IncomingMessageType } from '@app/enums';
import { IBaseIncomingMessage } from './base-incoming-message.interface';

export interface IGetHistoryIncomingMessage
  extends IBaseIncomingMessage<IncomingMessageType.GET_HISTORY> {
  room: string;
}
