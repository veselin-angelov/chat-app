import { MessageHandler } from '@app/messaging/types';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { messageService, usersService } from '@app/services';
import {
  IDirectMessagesHistoryOutgoingMessage,
  IErrorOutgoingMessage,
  IFetchDirectMessageHistoryIncomingMessage,
} from '@app/messaging/interfaces';

export const directMessageHistoryHandler: MessageHandler<
  IFetchDirectMessageHistoryIncomingMessage
> = (socket, data, currentUser) => {
  const targetUser = usersService.getUser(data.userId);

  if (!targetUser) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `User ${data.userId} not found`,
    });
  }

  const messages = messageService.getDirectMessageHistory(
    currentUser.id,
    targetUser.id,
  );

  return sendSafe<IDirectMessagesHistoryOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.DIRECT_MESSAGES_HISTORY,
    userId: targetUser.id,
    messages,
  });
};
