import { MessageInfo } from '@app/messaging/types';

/**
 * Service interface for message operations
 */
export interface IMessageService {
  sendRoomMessage(fromUserId: string, roomId: string, content: string): boolean;

  sendDirectMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
  ): boolean;

  getRoomMessageHistory(roomId: string): MessageInfo[];

  getDirectMessageHistory(userIdA: string, userIdB: string): MessageInfo[];
}
