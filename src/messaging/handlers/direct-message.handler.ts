import { MessageHandler } from '@app/messaging/types';
import {
  IAcknowledgeOutgoingMessage,
  IErrorOutgoingMessage,
} from 'src/messaging/interfaces/outgoing-messages';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { messageService, usersService } from '@app/services';
import { IDirectMessageIncomingMessage } from '@app/messaging/interfaces';

export const directMessageHandler: MessageHandler<
  IDirectMessageIncomingMessage
> = (socket, data, currentUser) => {
  const targetUser = usersService.getUser(data.userId);

  if (!targetUser) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `User ${data.userId} not found`,
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
  const sent = messageService.sendDirectMessage(
    currentUser.id,
    targetUser.id,
    data.message,
  );

  if (!sent) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: 'Failed to send message',
    });
  }

  // Send acknowledgment to the sender
  return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ACK,
    message: 'Direct message sent',
  });
};
