import { RoomInfo } from '@app/rooms/types';
import { IRoomsStorage } from '@app/storage/interfaces';
import { IRoomService } from '@app/rooms/interfaces';

/**
 * Service for room management operations
 */
export class RoomService implements IRoomService {
  constructor(private readonly roomsStorage: IRoomsStorage) {}

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
}
