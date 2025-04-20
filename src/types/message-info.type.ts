/**
 * Represents a message sent by a user in a room or directly to another user
 */
export type MessageInfo = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
} & (
  | {
      isDirect: true;
      toUserId: string;
    }
  | {
      isDirect: false;
      roomId: string;
    }
);
