import { MessageInfo } from '@app/types/message-info.type';

/**
 * Service interface for message operations
 */
export interface IMessageService {
  /**
   * Send a message to all subscribers of a room
   * @param fromUserId ID of the user sending the message
   * @param roomId ID of the target room
   * @param content Message content
   * @param messageId Optional message ID (generated if not provided)
   * @returns true if the message was successfully sent, false otherwise
   */
  sendRoomMessage(
    fromUserId: string,
    roomId: string,
    content: string,
    messageId?: string,
  ): boolean;

  /**
   * Send a direct message to a specific user
   * @param fromUserId ID of the user sending the message
   * @param toUserId ID of the recipient
   * @param content Message content
   * @param messageId Optional message ID (generated if not provided)
   * @returns true if the message was successfully sent, false otherwise
   */
  sendDirectMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
    messageId?: string,
  ): boolean;

  /**
   * Get message history for a room
   * @param roomId ID of the room
   * @param limit Maximum number of messages to return (newest first)
   * @param before Only return messages before this timestamp
   * @returns Array of message info objects
   */
  getRoomMessageHistory(
    roomId: string,
    limit?: number,
    before?: Date,
  ): MessageInfo[];

  /**
   * Get direct message history between two users
   * @param userIdA First user ID
   * @param userIdB Second user ID
   * @param limit Maximum number of messages to return (newest first)
   * @param before Only return messages before this timestamp
   * @returns Array of message info objects
   */
  getDirectMessageHistory(
    userIdA: string,
    userIdB: string,
    limit?: number,
    before?: Date,
  ): MessageInfo[];

  /**
   * Delete a message
   * @param messageId ID of the message to delete
   * @param userId ID of the user attempting to delete (for permission check)
   * @returns true if successful, false otherwise
   */
  deleteMessage(messageId: string, userId: string): boolean;
}
