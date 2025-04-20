import { v4 as uuidv4 } from 'uuid';
import { RoomInfo } from '@app/types';
import { IRoomsStorage } from '@app/interfaces/storage/rooms-storage.interface';

// Implementation of rooms storage
class RoomsStorage implements IRoomsStorage {
  private roomsMap: Map<string, RoomInfo>;

  constructor() {
    this.roomsMap = new Map<string, RoomInfo>();
    // Create default room
    this.createRoom('General Chat');
    this.createRoom('Development Chat');
  }

  createRoom(name: string): RoomInfo {
    const roomId = uuidv4();
    const room: RoomInfo = {
      id: roomId,
      name: name,
      users: new Set<string>(),
    };

    this.roomsMap.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): RoomInfo | undefined {
    return this.roomsMap.get(roomId);
  }

  getAllRooms(): RoomInfo[] {
    return Array.from(this.roomsMap.values());
  }

  removeRoom(roomId: string): void {
    const room = this.getRoom(roomId);

    if (!room) {
      return;
    }

    this.roomsMap.delete(roomId);
  }

  addUserToRoom(userId: string, roomId: string): boolean {
    const room = this.getRoom(roomId);

    if (!room) {
      return false;
    }

    room.users.add(userId);
    return true;
  }

  removeUserFromRoom(userId: string, roomId: string): boolean {
    const room = this.getRoom(roomId);

    if (!room) {
      return false;
    }

    return room.users.delete(userId);
  }

  getUsersInRoom(roomId: string): string[] {
    const room = this.getRoom(roomId);

    if (!room) {
      return [];
    }

    return Array.from(room.users);
  }

  // Helper methods
  getRoomsCount(): number {
    return this.roomsMap.size;
  }
}

// Export a singleton instance
export const roomsStorage = new RoomsStorage();
