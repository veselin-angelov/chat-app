import { WebSocket } from 'ws';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import {
  IMessagesStorage,
  IRoomsStorage,
  IUsersStorage,
} from '@app/storage/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import {
  IDirectMessageOutgoingMessage,
  IMessageOutgoingMessage,
  IMessageService,
} from '@app/messaging/interfaces';
import { MessageInfo } from '@app/messaging/types';
import { IUserService } from '@app/users/interfaces';
import { IRoomService } from '@app/rooms/interfaces';

/**
 * Service for message operations
 */
export class MessageService implements IMessageService {
  constructor(
    private readonly messagesStorage: IMessagesStorage,
    private readonly userService: IUserService,
    private readonly roomService: IRoomService,
    private readonly subscriptionService: ISubscriptionService,
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
    const user = this.userService.getUser(fromUserId);
    const room = this.roomService.getRoom(roomId);

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
    subscribers.forEach((subscriber) => {
      if (!subscriber || !subscriber.socket) {
        return;
      }

      this.sendMessageToSocket(
        subscriber.socket,
        message.id,
        roomId,
        content,
        user.id,
        user.username,
      );
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
    const fromUser = this.userService.getUser(fromUserId);
    const toUser = this.userService.getUser(toUserId);

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
    if (!!toUser.socket) {
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
    const room = this.roomService.getRoom(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    return this.messagesStorage.getRoomMessages(roomId);
  }

  /**
   * Get direct message history between two users
   */
  getDirectMessageHistory(userIdA: string, userIdB: string): MessageInfo[] {
    // Check if both users exist
    const userA = this.userService.getUser(userIdA);
    const userB = this.userService.getUser(userIdB);

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
    sendSafe<IMessageOutgoingMessage>(socket, {
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
    sendSafe<IDirectMessageOutgoingMessage>(socket, {
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
