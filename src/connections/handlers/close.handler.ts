import { usersService } from '@app/services';

/**
 * Handler for WebSocket close events
 * Uses the users service to properly clean up user data,
 * including unsubscribing from all rooms
 */
export const closeHandler =
  (userId: string) => (code: number, reason: Buffer) => {
    console.log(`User ${userId} disconnected: code=${code}, reason=${reason}`);

    // Use the users service to remove the user and clean up subscriptions
    usersService.removeUser(userId);
  };
