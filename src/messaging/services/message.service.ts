import { WebSocket } from 'ws';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import {
  IMessagesStorage,
  IRoomsStorage,
  IUsersStorage,
} from '@app/storage/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { IMessageService } from '@app/messaging/interfaces';
import { MessageInfo } from '@app/messaging/types';

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
  getRoomMessageHistory(roomId: string): MessageInfo[] {
    const room = this.roomsStorage.getRoom(roomId);

    if (!room) {
      // TODO: throw error
      return [];
    }

    return this.messagesStorage.getRoomMessages(roomId);
  }

  /**
   * Get direct message history between two users
   */
  getDirectMessageHistory(userIdA: string, userIdB: string): MessageInfo[] {
    // Check if both users exist
    const userA = this.usersStorage.getUser(userIdA);
    const userB = this.usersStorage.getUser(userIdB);

    if (!userA || !userB) {
      return [];
    }

    return this.messagesStorage.getDirectMessages(userIdA, userIdB);
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
      type: OutgoingMessageType.ROOM_MESSAGE,
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
