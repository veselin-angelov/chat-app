import { UserInfo } from '@app/users/types';

/**
 * Represents a message sent by a user in a room or directly to another user
 */
export type MessageInfo = {
  id: string;
  from: Pick<UserInfo, 'id' | 'username'>;
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
