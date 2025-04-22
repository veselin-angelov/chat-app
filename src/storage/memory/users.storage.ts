import { IUsersStorage } from '@app/storage/interfaces';
import { UserInfo } from '@app/users/types';

export class UsersStorage implements IUsersStorage {
  private usersMap: Map<string, UserInfo>;

  constructor() {
    this.usersMap = new Map<string, UserInfo>();
  }

  addUser(user: UserInfo): UserInfo {
    this.usersMap.set(user.id, user);
    return user;
  }

  getUser(userId: string): UserInfo | undefined {
    return this.usersMap.get(userId);
  }

  removeUser(userId: string): void {
    this.usersMap.delete(userId);
  }

  addRoomToUser(userId: string, roomId: string): boolean {
    const user = this.getUser(userId);

    if (!user) {
      return false;
    }

    user.rooms.add(roomId);
    return true;
  }

  removeRoomFromUser(userId: string, roomId: string): boolean {
    const user = this.getUser(userId);

    if (!user) {
      return false;
    }

    return user.rooms.delete(roomId);
  }

  isUserInRoom(userId: string, roomId: string): boolean {
    const user = this.getUser(userId);

    if (!user) {
      return false;
    }

    return user.rooms.has(roomId);
  }

  // Helper methods
  getAllUsers(): UserInfo[] {
    return Array.from(this.usersMap.values());
  }
}
