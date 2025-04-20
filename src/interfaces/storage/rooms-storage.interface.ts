import { RoomInfo } from '@app/types';

/**
 * Interface for room storage operations
 */
export interface IRoomsStorage {
  /**
   * Create a new room
   * @param name Name of the room to create
   * @returns Created room info
   */
  createRoom(name: string): RoomInfo;

  /**
   * Get a room by ID
   * @param roomId ID of the room
   * @returns Room info or undefined if not found
   */
  getRoom(roomId: string): RoomInfo | undefined;

  /**
   * Get all rooms in the system
   * @returns Array of all room info objects
   */
  getAllRooms(): RoomInfo[];

  /**
   * Remove a room from storage
   * @param roomId ID of the room to remove
   */
  removeRoom(roomId: string): void;

  /**
   * Add a user to a room's subscribers
   * @param userId ID of the user to add
   * @param roomId ID of the room
   * @returns true if successful, false if room not found
   */
  addUserToRoom(userId: string, roomId: string): boolean;

  /**
   * Remove a user from a room's subscribers
   * @param userId ID of the user to remove
   * @param roomId ID of the room
   * @returns true if successful, false if room not found or user not in room
   */
  removeUserFromRoom(userId: string, roomId: string): boolean;

  /**
   * Get all users subscribed to a room
   * @param roomId ID of the room
   * @returns Array of user IDs
   */
  getUsersInRoom(roomId: string): string[];
}
