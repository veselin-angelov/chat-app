import { MessageInfo } from '@app/messaging/types';

/**
 * Interface for message storage operations
 */
export interface IMessagesStorage {
  /**
   * Create a new message
   * @param userId ID of the user sending the message
   * @param username Username of the sender
   * @param roomId ID of the target room
   * @param content Message content
   * @returns Created message info
   */
  createMessage(
    userId: string,
    username: string,
    roomId: string,
    content: string,
  ): MessageInfo;

  /**
   * Create a new direct message
   * @param fromUserId ID of the user sending the message
   * @param fromUsername Username of the sender
   * @param toUserId ID of the recipient
   * @param content Message content
   * @returns Created message info
   */
  createDirectMessage(
    fromUserId: string,
    fromUsername: string,
    toUserId: string,
    content: string,
  ): MessageInfo;

  /**
   * Get a message by ID
   * @param messageId ID of the message
   * @returns Message info or undefined if not found
   */
  getMessage(messageId: string): MessageInfo | undefined;

  /**
   * Get messages for a specific room
   * @param roomId ID of the room
   * @returns Array of message info objects
   */
  getRoomMessages(roomId: string): MessageInfo[];

  /**
   * Get direct messages between two users
   * @param userIdA ID of the first user
   * @param userIdB ID of the second user
   * @returns Array of message info objects
   */
  getDirectMessages(userIdA: string, userIdB: string): MessageInfo[];

  /**
   * Clear all messages in a room
   * @param roomId ID of the room
   */
  clearRoomMessages(roomId: string): void;
}
