import { RoomInfo } from '@app/rooms/types';
import { UserInfo } from '@app/users/types';
import { IUsersStorage, IRoomsStorage } from '@app/storage/interfaces';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { IRoomService } from '@app/rooms/interfaces';

/**
 * Service for room management operations
 */
export class RoomService implements IRoomService {
  constructor(
    private readonly roomsStorage: IRoomsStorage,
    private readonly usersStorage: IUsersStorage,
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  /**
   * Create a new room
   */
  createRoom(name: string): RoomInfo {
    return this.roomsStorage.createRoom(name);
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId: string): RoomInfo | undefined {
    return this.roomsStorage.getRoom(roomId);
  }

  /**
   * Get all rooms in the system
   */
  getAllRooms(): RoomInfo[] {
    return this.roomsStorage.getAllRooms();
  }

  /**
   * Remove a room completely from the system
   * This includes unsubscribing all users from the room
   */
  removeRoom(roomId: string): boolean {
    const room = this.roomsStorage.getRoom(roomId);

    if (!room) {
      return false;
    }

    // Get all users subscribed to the room before removal
    const subscribedUsers = Array.from(room.users);

    // Unsubscribe all users from the room
    subscribedUsers.forEach((userId) => {
      this.subscriptionService.unsubscribeUserFromRoom(userId, roomId);
    });

    // Now that all users are unsubscribed, remove the room itself
    this.roomsStorage.removeRoom(roomId);

    return true;
  }

  /**
   * Get all users subscribed to a specific room
   */
  getRoomUsers(roomId: string): UserInfo[] {
    const userIds = this.roomsStorage.getUsersInRoom(roomId);

    return userIds
      .map((userId) => this.usersStorage.getUser(userId))
      .filter((user): user is UserInfo => user !== undefined);
  }
}
