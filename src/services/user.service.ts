import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { UserInfo } from '../types/user-info.type';
import { IUsersStorage, IRoomsStorage } from '@app/interfaces/storage';
import { ISubscriptionService } from '../interfaces/subscription-service.interface';
import { IUserService } from '../interfaces/users-service.interface';
import { generateUsername } from '../helpers/usernames.helper';

/**
 * Service for user management operations
 */
export class UserService implements IUserService {
  constructor(
    private readonly usersStorage: IUsersStorage,
    private readonly roomsStorage: IRoomsStorage,
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  /**
   * Create a new user
   */
  createUser(socket: WebSocket): UserInfo {
    // Create a new user with generated ID and username
    const user: UserInfo = {
      id: uuidv4(),
      username: generateUsername(),
      socket: socket,
      rooms: new Set<string>(),
    };

    // Add the user to storage
    return this.usersStorage.addUser(user);
  }

  /**
   * Get a user by ID
   */
  getUser(userId: string): UserInfo | undefined {
    return this.usersStorage.getUser(userId);
  }

  /**
   * Get all users in the system
   */
  getAllUsers(): UserInfo[] {
    return this.usersStorage.getAllUsers();
  }

  /**
   * Remove a user completely from the system, including unsubscribing from all rooms
   */
  removeUser(userId: string): boolean {
    const user = this.usersStorage.getUser(userId);

    if (!user) {
      return false;
    }

    // Get all rooms the user is subscribed to before removal
    const subscribedRooms = [...user.rooms];

    // Unsubscribe from all rooms
    for (const roomId of subscribedRooms) {
      this.subscriptionService.unsubscribeUserFromRoom(userId, roomId);
    }

    // Finally remove the user from storage
    this.usersStorage.removeUser(userId);

    return true;
  }

  /**
   * Get all users subscribed to a specific room
   */
  getUsersInRoom(roomId: string): UserInfo[] {
    const room = this.roomsStorage.getRoom(roomId);

    if (!room) {
      return [];
    }

    return Array.from(room.users)
      .map((userId) => this.usersStorage.getUser(userId))
      .filter((user): user is UserInfo => user !== undefined);
  }
}
