import { WebSocket } from 'ws';
import { IBaseIncomingMessage } from '@app/interfaces/messages';
import { UserInfo } from '@app/types/user-info.type';

export type MessageHandler<T extends IBaseIncomingMessage> = (
  socket: WebSocket,
  data: T,
  currentUser: UserInfo,
) => void;
