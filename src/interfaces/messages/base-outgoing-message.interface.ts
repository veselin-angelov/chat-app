import { OutgoingMessageType } from '@app/enums';

export interface IBaseOutgoingMessage<
  T extends OutgoingMessageType = OutgoingMessageType,
> {
  id: string;
  type: T;
}
