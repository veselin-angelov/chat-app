import { MessageInfo } from '@app/messaging/types';

/**
 * Service interface for message operations
 */
export interface IMessageService {
  /**
   * Send a message to all subscribers of a room
   * @param fromUserId ID of the user sending the message
   * @param roomId ID of the target room
   * @param content Message content
   * @returns true if the message was successfully sent, false otherwise
   */
  sendRoomMessage(fromUserId: string, roomId: string, content: string): boolean;

  /**
   * Send a direct message to a specific user
   * @param fromUserId ID of the user sending the message
   * @param toUserId ID of the recipient
   * @param content Message content
   * @returns true if the message was successfully sent, false otherwise
   */
  sendDirectMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
  ): boolean;

  /**
   * Get message history for a room
   * @param roomId ID of the room
   * @returns Array of message info objects
   */
  getRoomMessageHistory(roomId: string): MessageInfo[];

  /**
   * Get direct message history between two users
   * @param userIdA First user ID
   * @param userIdB Second user ID
   * @returns Array of message info objects
   */
  getDirectMessageHistory(userIdA: string, userIdB: string): MessageInfo[];
}
