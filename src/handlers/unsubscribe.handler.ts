import { MessageHandler } from '@app/types';
import {
  IAcknowledgeOutgoingMessage,
  IErrorOutgoingMessage,
  IUnsubscribeIncomingMessage,
} from '@app/interfaces/messages';
import { sendSafe } from '@app/helpers';
import { OutgoingMessageType } from '@app/enums';
import { roomService, subscriptionService } from '@app/services';

export const unsubscribeHandler: MessageHandler<IUnsubscribeIncomingMessage> = (
  socket,
  data,
  currentUser,
) => {
  const room = roomService.getRoom(data.room);

  if (!room) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Room ${data.room} not found`,
    });
  }

  // Use the subscription service to handle the bidirectional relationship
  const unsubscribed = subscriptionService.unsubscribeUserFromRoom(
    currentUser.id,
    data.room,
  );

  if (!unsubscribed) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Failed to unsubscribe from room ${data.room}`,
    });
  }

  return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ACK,
    message: 'Unsubscribed',
  });
};
