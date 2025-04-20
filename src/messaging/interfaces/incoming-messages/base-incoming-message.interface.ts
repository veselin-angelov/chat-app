import { IncomingMessageType } from '@app/messaging/enums';

export interface IBaseIncomingMessage<
  T extends IncomingMessageType = IncomingMessageType,
> {
  id: string;
  type: T;
}
