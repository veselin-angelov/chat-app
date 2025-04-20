import { RoomInfo } from '@app/rooms/types';
import { UserInfo } from '@app/users/types';

/**
 * Service interface for room management operations
 */
export interface IRoomService {
  /**
   * Create a new room
   * @param name Name of the room
   * @returns Created room information
   */
  createRoom(name: string): RoomInfo;

  /**
   * Get room by ID
   * @param roomId ID of the room to retrieve
   * @returns Room information or undefined if not found
   */
  getRoom(roomId: string): RoomInfo | undefined;

  /**
   * Get all rooms in the system
   * @returns Array of all rooms
   */
  getAllRooms(): RoomInfo[];

  /**
   * Remove a room completely from the system
   * This includes unsubscribing all users from the room
   * @param roomId ID of the room to remove
   * @returns true if room was removed, false if room wasn't found
   */
  removeRoom(roomId: string): boolean;

  /**
   * Get a list of all users subscribed to a room
   * @param roomId ID of the room
   * @returns Array of user objects
   */
  getRoomUsers(roomId: string): UserInfo[];
}
