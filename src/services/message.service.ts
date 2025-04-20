import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { sendSafe } from '../helpers/socket.helper';
import { OutgoingMessageType } from '../enums/outgoing-message-type.enum';
import {
  IUsersStorage,
  IRoomsStorage,
  IMessagesStorage,
} from '@app/interfaces/storage';
import { ISubscriptionService } from '../interfaces/subscription-service.interface';
import { IMessageService } from '../interfaces/message-service.interface';
import { MessageInfo } from '../types/message-info.type';

/**
 * Service for message operations
 */
export class MessageService implements IMessageService {
  constructor(
    private readonly usersStorage: IUsersStorage,
    private readonly roomsStorage: IRoomsStorage,
    private readonly subscriptionService: ISubscriptionService,
    private readonly messagesStorage: IMessagesStorage,
  ) {}

  /**
   * Send a message to all subscribers of a room
   */
  sendRoomMessage(
    fromUserId: string,
    roomId: string,
    content: string,
    messageId: string = uuidv4(),
  ): boolean {
    // Validate inputs
    const user = this.usersStorage.getUser(fromUserId);
    const room = this.roomsStorage.getRoom(roomId);

    if (!user || !room) {
      return false;
    }

    // Check if user is subscribed to the room
    if (!this.subscriptionService.isUserSubscribedToRoom(fromUserId, roomId)) {
      return false;
    }

    // Store the message
    const message = this.messagesStorage.createMessage(
      fromUserId,
      user.username,
      roomId,
      content,
      messageId,
    );

    // Get all subscribers except the sender
    const subscribers = this.subscriptionService.getRoomSubscribersExcept(
      roomId,
      fromUserId,
    );

    // Send message to all subscribers
    subscribers.forEach((subscriberId) => {
      const subscriber = this.usersStorage.getUser(subscriberId);
      if (subscriber && subscriber.socket) {
        this.sendMessageToSocket(
          subscriber.socket,
          message.id,
          roomId,
          content,
          user.id,
          user.username,
        );
      }
    });

    return true;
  }

  /**
   * Send a direct message to a specific user
   */
  sendDirectMessage(
    fromUserId: string,
    toUserId: string,
    content: string,
    messageId: string = uuidv4(),
  ): boolean {
    // Validate inputs
    const fromUser = this.usersStorage.getUser(fromUserId);
    const toUser = this.usersStorage.getUser(toUserId);

    if (!fromUser || !toUser) {
      return false;
    }

    // Store the direct message
    const message = this.messagesStorage.createDirectMessage(
      fromUserId,
      fromUser.username,
      toUserId,
      content,
      messageId,
    );

    // Send to recipient if they're online
    if (toUser.socket) {
      this.sendDirectMessageToSocket(
        toUser.socket,
        message.id,
        content,
        fromUser.id,
        fromUser.username,
      );
    }

    return true;
  }

  /**
   * Get message history for a room
   */
  getRoomMessageHistory(
    roomId: string,
    limit?: number,
    before?: Date,
  ): MessageInfo[] {
    // Check if room exists
    const room = this.roomsStorage.getRoom(roomId);
    if (!room) {
      return [];
    }

    return this.messagesStorage.getRoomMessages(roomId, limit, before);
  }

  /**
   * Get direct message history between two users
   */
  getDirectMessageHistory(
    userIdA: string,
    userIdB: string,
    limit?: number,
    before?: Date,
  ): MessageInfo[] {
    // Check if both users exist
    const userA = this.usersStorage.getUser(userIdA);
    const userB = this.usersStorage.getUser(userIdB);

    if (!userA || !userB) {
      return [];
    }

    return this.messagesStorage.getDirectMessages(
      userIdA,
      userIdB,
      limit,
      before,
    );
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string, userId: string): boolean {
    // Check if message exists
    const message = this.messagesStorage.getMessage(messageId);
    if (!message) {
      return false;
    }

    // Check if user is the creator of the message (permission check)
    if (message.userId !== userId) {
      return false;
    }

    // Delete the message
    return this.messagesStorage.deleteMessage(messageId);
  }

  /**
   * Helper method to send message to a specific socket
   */
  private sendMessageToSocket(
    socket: WebSocket,
    messageId: string,
    roomId: string,
    content: string,
    fromUserId: string,
    fromUsername: string,
  ): void {
    sendSafe(socket, {
      id: messageId,
      type: OutgoingMessageType.MESSAGE,
      room: roomId,
      message: content,
      from: {
        id: fromUserId,
        username: fromUsername,
      },
    });
  }

  /**
   * Helper method to send direct message to a specific socket
   */
  private sendDirectMessageToSocket(
    socket: WebSocket,
    messageId: string,
    content: string,
    fromUserId: string,
    fromUsername: string,
  ): void {
    sendSafe(socket, {
      id: messageId,
      type: OutgoingMessageType.DIRECT_MESSAGE,
      message: content,
      from: {
        id: fromUserId,
        username: fromUsername,
      },
    });
  }
}
