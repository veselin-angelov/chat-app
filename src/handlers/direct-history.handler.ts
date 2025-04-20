import { MessageHandler } from '@app/types';
import {
  IDirectHistoryOutgoingMessage,
  IErrorOutgoingMessage,
  IGetDirectHistoryIncomingMessage,
} from '@app/interfaces/messages';
import { sendSafe } from '@app/helpers';
import { OutgoingMessageType } from '@app/enums';
import { messageService, usersService } from '@app/services';

export const directHistoryHandler: MessageHandler<
  IGetDirectHistoryIncomingMessage
> = (socket, data, currentUser) => {
  const targetUser = usersService.getUser(data.userId);

  if (!targetUser) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `User ${data.userId} not found`,
    });
  }

  // Get direct message history
  const messages = messageService.getDirectMessageHistory(
    currentUser.id,
    targetUser.id,
    data.limit,
  );

  // Send message history to the requester
  return sendSafe<IDirectHistoryOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.DIRECT_HISTORY,
    userId: targetUser.id,
    messages,
  });
};
