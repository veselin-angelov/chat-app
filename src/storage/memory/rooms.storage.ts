import { v4 as uuidv4 } from 'uuid';
import { RoomInfo } from '@app/rooms/types';
import { IRoomsStorage } from '@app/storage/interfaces';

export class RoomsStorage implements IRoomsStorage {
  private roomsMap: Map<string, RoomInfo>;

  constructor() {
    this.roomsMap = new Map<string, RoomInfo>();
    // Create default rooms
    this.createRoom('General Chat');
    this.createRoom('Development Chat');
  }

  createRoom(name: string): RoomInfo {
    const room: RoomInfo = {
      id: uuidv4(),
      name: name,
      users: new Set<string>(),
    };

    this.roomsMap.set(room.id, room);
    return room;
  }

  getRoom(roomId: string): RoomInfo | undefined {
    return this.roomsMap.get(roomId);
  }

  getAllRooms(): RoomInfo[] {
    return Array.from(this.roomsMap.values());
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
}
