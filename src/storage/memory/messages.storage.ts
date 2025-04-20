import { v4 as uuidv4 } from 'uuid';
import { MessageInfo } from '@app/messaging/types';
import { IMessagesStorage } from '@app/storage/interfaces';

// Implementation of messages storage
class MessagesStorage implements IMessagesStorage {
  private messagesMap: Map<string, MessageInfo>;
  private roomMessages: Map<string, Set<string>>;
  private directMessages: Map<string, Set<string>>;

  constructor() {
    this.messagesMap = new Map<string, MessageInfo>();
    this.roomMessages = new Map<string, Set<string>>();
    this.directMessages = new Map<string, Set<string>>();
  }

  createMessage(
    userId: string,
    username: string,
    roomId: string,
    content: string,
  ): MessageInfo {
    // Create the message
    const message: MessageInfo = {
      id: uuidv4(),
      from: {
        id: userId,
        username,
      },
      roomId,
      content,
      timestamp: new Date(),
      isDirect: false,
    };

    // Store the message
    this.messagesMap.set(message.id, message);

    // Add to room index
    this.addMessageToRoom(roomId, message.id);

    return message;
  }

  createDirectMessage(
    fromUserId: string,
    fromUsername: string,
    toUserId: string,
    content: string,
  ): MessageInfo {
    // Create the message
    const message: MessageInfo = {
      id: uuidv4(),
      from: {
        id: fromUserId,
        username: fromUsername,
      },
      toUserId,
      content,
      timestamp: new Date(),
      isDirect: true,
    };

    // Store the message
    this.messagesMap.set(message.id, message);

    // Add to direct message index
    this.addToDirectMessageIndex(fromUserId, toUserId, message.id);

    return message;
  }

  getMessage(messageId: string): MessageInfo | undefined {
    return this.messagesMap.get(messageId);
  }

  getRoomMessages(roomId: string): MessageInfo[] {
    const roomMessageIds = this.roomMessages.get(roomId) || new Set<string>();

    // Get all messages for this room
    let messages = Array.from(roomMessageIds)
      .map((id) => this.messagesMap.get(id))
      .filter((m): m is MessageInfo => !!m && !m.isDirect); // Ensure it's not a direct message

    // Sort by timestamp (newest first)
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return messages;
  }

  getDirectMessages(userIdA: string, userIdB: string): MessageInfo[] {
    const conversationKey = this.getConversationKey(userIdA, userIdB);

    const directMessageIds =
      this.directMessages.get(conversationKey) || new Set<string>();

    // Get all direct messages between these users
    let messages = Array.from(directMessageIds)
      .map((id) => this.messagesMap.get(id))
      .filter((m): m is MessageInfo => !!m && m.isDirect); // Ensure it's a direct message

    // Sort by timestamp (newest first)
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return messages;
  }

  clearRoomMessages(roomId: string): void {
    const messageIds = this.roomMessages.get(roomId) || new Set<string>();

    // Delete each message
    for (const messageId of messageIds) {
      this.messagesMap.delete(messageId);
    }

    // Clear the room's message set
    this.roomMessages.delete(roomId);
  }

  // Helper methods
  private addMessageToRoom(roomId: string, messageId: string): void {
    let roomSet = this.roomMessages.get(roomId);

    if (!roomSet) {
      roomSet = new Set<string>();
      this.roomMessages.set(roomId, roomSet);
    }

    roomSet.add(messageId);
  }

  private removeMessageFromRoom(roomId: string, messageId: string): void {
    const roomSet = this.roomMessages.get(roomId);

    if (roomSet) {
      roomSet.delete(messageId);

      // Clean up empty sets
      if (roomSet.size === 0) {
        this.roomMessages.delete(roomId);
      }
    }
  }

  private getConversationKey(userIdA: string, userIdB: string): string {
    // Create a consistent key by sorting user IDs
    return [userIdA, userIdB].sort().join(':');
  }

  private addToDirectMessageIndex(
    fromUserId: string,
    toUserId: string,
    messageId: string,
  ): void {
    const conversationKey = this.getConversationKey(fromUserId, toUserId);
    let messageSet = this.directMessages.get(conversationKey);

    if (!messageSet) {
      messageSet = new Set<string>();
      this.directMessages.set(conversationKey, messageSet);
    }

    messageSet.add(messageId);
  }

  private removeFromDirectMessageIndex(
    fromUserId: string,
    toUserId: string,
    messageId: string,
  ): void {
    const conversationKey = this.getConversationKey(fromUserId, toUserId);
    const messageSet = this.directMessages.get(conversationKey);

    if (messageSet) {
      messageSet.delete(messageId);

      // Clean up empty sets
      if (messageSet.size === 0) {
        this.directMessages.delete(conversationKey);
      }
    }
  }
}

// Export a singleton instance
export const messagesStorage = new MessagesStorage();
