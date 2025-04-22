import { RoomInfo } from '@app/rooms/types';

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
}
