import { WebSocket } from 'ws';
import { UserInfo } from '@app/users/types';
import { IBaseIncomingMessage } from '@app/messaging/interfaces/incoming-messages';
import { IncomingMessageType } from '@app/messaging/enums';

/**
 * Interface for message handlers that process specific message types
 */
export interface IMessageHandler<
  T extends IBaseIncomingMessage = IBaseIncomingMessage,
> {
  readonly messageType: IncomingMessageType;

  handle(socket: WebSocket, message: T, currentUser: UserInfo): Promise<void>;
}
