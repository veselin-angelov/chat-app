import { MessageHandler } from '@app/types';
import {
  IAcknowledgeOutgoingMessage,
  IDirectMessageIncomingMessage,
  IErrorOutgoingMessage,
} from '@app/interfaces/messages';
import { sendSafe } from '@app/helpers';
import { OutgoingMessageType } from '@app/enums';
import { usersService } from '@app/services';

export const directMessageHandler: MessageHandler<
  IDirectMessageIncomingMessage
> = (socket, data, currentUser) => {
  const targetUser = usersService.getUser(data.to);

  if (!targetUser) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `User ${data.to} not found`,
    });
  }

  // Check if target user is connected
  if (!targetUser.socket) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `User ${targetUser.username} is offline`,
    });
  }

  // Send the direct message to the recipient
  sendSafe(targetUser.socket, {
    id: data.id,
    type: OutgoingMessageType.DIRECT_MESSAGE,
    from: {
      id: currentUser.id,
      username: currentUser.username,
    },
    message: data.message,
  });

  // Send acknowledgment to the sender
  return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ACK,
    message: 'Direct message sent',
  });
};
