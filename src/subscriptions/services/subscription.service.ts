import { IUsersStorage, IRoomsStorage } from '@app/storage/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';

/**
 * Service for managing user subscriptions to rooms
 */
export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly usersStorage: IUsersStorage,
    private readonly roomsStorage: IRoomsStorage,
  ) {}

  subscribeUserToRoom(userId: string, roomId: string): boolean {
    const user = this.usersStorage.getUser(userId);
    const room = this.roomsStorage.getRoom(roomId);

    if (!user || !room) {
      return false;
    }

    // Update both sides of the relationship atomically
    const userAdded = this.usersStorage.addRoomToUser(userId, roomId);
    const roomAdded = this.roomsStorage.addUserToRoom(userId, roomId);

    // If one succeeded but the other failed, rollback for consistency
    if (userAdded && !roomAdded) {
      this.usersStorage.removeRoomFromUser(userId, roomId);
      return false;
    }

    if (!userAdded && roomAdded) {
      this.roomsStorage.removeUserFromRoom(userId, roomId);
      return false;
    }

    return userAdded && roomAdded;
  }

  unsubscribeUserFromRoom(userId: string, roomId: string): boolean {
    const user = this.usersStorage.getUser(userId);
    const room = this.roomsStorage.getRoom(roomId);

    if (!user || !room) {
      return false;
    }

    // Update both sides of the relationship
    const userRemoved = this.usersStorage.removeRoomFromUser(userId, roomId);
    const roomRemoved = this.roomsStorage.removeUserFromRoom(userId, roomId);

    // As long as either operation succeeded, consider it successful
    // (idempotent operation - removing something that's already gone is fine)
    return userRemoved || roomRemoved;
  }

  isUserSubscribedToRoom(userId: string, roomId: string): boolean {
    // We can check from either side, but prefer the user side for efficiency
    return this.usersStorage.isUserInRoom(userId, roomId);
  }

  getUserSubscriptions(userId: string): string[] {
    return this.usersStorage.getUserRooms(userId);
  }

  getRoomSubscribers(roomId: string): string[] {
    return this.roomsStorage.getUsersInRoom(roomId);
  }

  // Utility methods

  /**
   * Get all subscribers to a room except the specified user
   * @param roomId The ID of the room
   * @param excludeUserId User ID to exclude
   * @returns Array of user IDs subscribed to the room, excluding the specified user
   */
  getRoomSubscribersExcept(roomId: string, excludeUserId: string): string[] {
    return this.getRoomSubscribers(roomId).filter((id) => id !== excludeUserId);
  }
}
