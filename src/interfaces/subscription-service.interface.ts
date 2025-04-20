export interface ISubscriptionService {
  subscribeUserToRoom(userId: string, roomId: string): boolean;
  unsubscribeUserFromRoom(userId: string, roomId: string): boolean;
  isUserSubscribedToRoom(userId: string, roomId: string): boolean;
  getUserSubscriptions(userId: string): string[];
  getRoomSubscribers(roomId: string): string[];
  getRoomSubscribersExcept(roomId: string, excludeUserId: string): string[];
}
