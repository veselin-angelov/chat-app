import { UserInfo } from '@app/users/types';

/**
 * Service interface for managing user subscriptions to rooms
 */
export interface ISubscriptionService {
  /**
   * Subscribe a user to a room
   * @param userId ID of the user to subscribe
   * @param roomId ID of the room to subscribe to
   * @returns true if subscription was successful, false otherwise
   */
  subscribeUserToRoom(userId: string, roomId: string): boolean;

  /**
   * Unsubscribe a user from a room
   * @param userId ID of the user to unsubscribe
   * @param roomId ID of the room to unsubscribe from
   * @returns true if unsubscription was successful, false otherwise
   */
  unsubscribeUserFromRoom(userId: string, roomId: string): boolean;

  /**
   * Check if a user is subscribed to a room
   * @param userId ID of the user to check
   * @param roomId ID of the room to check
   * @returns true if the user is subscribed to the room, false otherwise
   */
  isUserSubscribedToRoom(userId: string, roomId: string): boolean;

  /**
   * Get all users subscribed to a room
   * @param roomId ID of the room to get subscribers for
   * @returns Array of user information for all subscribers
   */
  getRoomSubscribers(roomId: string): UserInfo[];

  /**
   * Get all users subscribed to a room, excluding a specific user
   * @param roomId ID of the room to get subscribers for
   * @param excludeUserId ID of the user to exclude from the list
   * @returns Array of user information for all subscribers except the excluded user
   */
  getRoomSubscribersExcept(roomId: string, excludeUserId: string): UserInfo[];
}
