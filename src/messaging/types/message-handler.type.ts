import { WebSocket } from 'ws';
import { IBaseIncomingMessage } from '@app/messaging/interfaces';
import { UserInfo } from '@app/users/types';

export type MessageHandler<T extends IBaseIncomingMessage> = (
  socket: WebSocket,
  data: T,
  currentUser: UserInfo,
) => void;
