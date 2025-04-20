import { UserInfo } from '@app/users/types';

/**
 * Interface for user storage operations
 */
export interface IUsersStorage {
  /**
   * Add a new user to storage
   * @param user User info object to add
   * @returns The added user info
   */
  addUser(user: UserInfo): UserInfo;

  /**
   * Get a user by ID
   * @param userId ID of the user to retrieve
   * @returns User info or undefined if not found
   */
  getUser(userId: string): UserInfo | undefined;

  /**
   * Remove a user from storage
   * @param userId ID of the user to remove
   */
  removeUser(userId: string): void;

  /**
   * Add a room to a user's subscriptions
   * @param userId ID of the user
   * @param roomId ID of the room to add
   * @returns true if successful, false if user not found
   */
  addRoomToUser(userId: string, roomId: string): boolean;

  /**
   * Remove a room from a user's subscriptions
   * @param userId ID of the user
   * @param roomId ID of the room to remove
   * @returns true if successful, false if user not found or not in room
   */
  removeRoomFromUser(userId: string, roomId: string): boolean;

  /**
   * Get all rooms a user is subscribed to
   * @param userId ID of the user
   * @returns Array of room IDs
   */
  getUserRooms(userId: string): string[];

  /**
   * Check if a user is subscribed to a specific room
   * @param userId ID of the user
   * @param roomId ID of the room
   * @returns true if user is in room, false otherwise
   */
  isUserInRoom(userId: string, roomId: string): boolean;

  /**
   * Get all users in the system
   * @returns Array of all user info objects
   */
  getAllUsers(): UserInfo[];
}
