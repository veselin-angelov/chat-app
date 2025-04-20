import { MessageHandler } from '@app/messaging/types';
import {
  IAcknowledgeOutgoingMessage,
  IErrorOutgoingMessage,
  ISubscribeIncomingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { roomService, subscriptionService } from '@app/services';

export const subscribeHandler: MessageHandler<ISubscribeIncomingMessage> = (
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
  const subscribed = subscriptionService.subscribeUserToRoom(
    currentUser.id,
    data.room,
  );

  if (!subscribed) {
    return sendSafe<IErrorOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ERROR,
      message: `Failed to subscribe to room ${data.room}`,
    });
  }

  return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
    id: data.id,
    type: OutgoingMessageType.ACK,
    message: 'Subscribed',
  });
};
