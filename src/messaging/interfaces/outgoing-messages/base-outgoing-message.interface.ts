import { OutgoingMessageType } from '@app/messaging/enums';

export interface IBaseOutgoingMessage<
  T extends OutgoingMessageType = OutgoingMessageType,
> {
  id: string;
  type: T;
}
