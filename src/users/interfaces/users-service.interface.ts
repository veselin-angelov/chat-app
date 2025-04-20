import { WebSocket } from 'ws';
import { UserInfo } from '@app/users/types';

/**
 * Service interface for user management operations
 */
export interface IUserService {
  /**
   * Create a new user
   * @param socket WebSocket connection for the user
   * @returns Created user information
   */
  createUser(socket: WebSocket): UserInfo;

  /**
   * Get user by ID
   * @param userId ID of the user to retrieve
   * @returns User information or undefined if not found
   */
  getUser(userId: string): UserInfo | undefined;

  /**
   * Get all users in the system
   * @returns Array of all users
   */
  getAllUsers(): UserInfo[];

  /**
   * Remove a user completely from the system
   * This includes unsubscribing from all rooms
   * @param userId ID of the user to remove
   * @returns true if user was removed, false if user wasn't found
   */
  removeUser(userId: string): boolean;

  /**
   * Get users subscribed to a specific room
   * @param roomId ID of the room
   * @returns Array of users in the room
   */
  getUsersInRoom(roomId: string): UserInfo[];
}
