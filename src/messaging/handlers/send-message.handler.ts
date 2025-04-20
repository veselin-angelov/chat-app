import { MessageHandler } from '@app/messaging/types';
import {
  IAcknowledgeOutgoingMessage,
  IErrorOutgoingMessage,
} from 'src/messaging/interfaces/outgoing-messages';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { messageService, roomService } from '@app/services';
import { ISendMessageIncomingMessage } from '@app/messaging/interfaces';

export const sendMessageHandler: MessageHandler<ISendMessageIncomingMessage> = (
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

  // Use the message service to handle message sending and storage
  const sent = messageService.sendRoomMessage(
    currentUser.id,
    data.room,
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
    message: 'Message sent',
  });
};
