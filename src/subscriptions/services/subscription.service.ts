import { IUsersStorage, IRoomsStorage } from '@app/storage/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { UserInfo } from '@app/users/types';

/**
 * Service for managing user subscriptions to rooms (the relationship between users and rooms)
 */
export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly usersStorage: IUsersStorage,
    private readonly roomsStorage: IRoomsStorage,
  ) {}

  /**
   * Subscribe a user to a room
   */
  subscribeUserToRoom(userId: string, roomId: string): boolean {
    const user = this.usersStorage.getUser(userId);
    const room = this.roomsStorage.getRoom(roomId);

    if (!user || !room) {
      return false;
    }

    // Add room to user's subscriptions
    this.usersStorage.addRoomToUser(userId, roomId);

    // Add user to room's subscribers
    this.roomsStorage.addUserToRoom(userId, roomId);

    return true;
  }

  /**
   * Unsubscribe a user from a room
   */
  unsubscribeUserFromRoom(userId: string, roomId: string): boolean {
    const user = this.usersStorage.getUser(userId);
    const room = this.roomsStorage.getRoom(roomId);

    if (!user || !room) {
      return false;
    }

    // Remove room from user's subscriptions
    this.usersStorage.removeRoomFromUser(userId, roomId);

    // Remove user from room's subscribers
    this.roomsStorage.removeUserFromRoom(userId, roomId);

    return true;
  }

  /**
   * Get all users subscribed to a room
   */
  getRoomSubscribers(roomId: string): UserInfo[] {
    const userIds = this.roomsStorage.getUsersInRoom(roomId);

    return userIds
      .map((userId) => this.usersStorage.getUser(userId))
      .filter((user) => !!user);
  }

  /**
   * Check if a user is subscribed to a room
   */
  isUserSubscribedToRoom(userId: string, roomId: string): boolean {
    return this.usersStorage.isUserInRoom(userId, roomId);
  }

  /**
   * Get all subscribers for a room except a specific user
   */
  getRoomSubscribersExcept(roomId: string, excludeUserId: string): UserInfo[] {
    return this.getRoomSubscribers(roomId).filter(
      (user) => user.id !== excludeUserId,
    );
  }
}
