import { IAcknowledgeOutgoingMessage } from 'src/messaging/interfaces/outgoing-messages';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import {
  IMessageHandler,
  IMessageService,
  ISendMessageIncomingMessage,
} from '@app/messaging/interfaces';
import { IRoomService } from '@app/rooms/interfaces';
import { UserInfo } from '@app/users/types';
import { WebSocket } from 'ws';

export class SendRoomMessageHandler
  implements IMessageHandler<ISendMessageIncomingMessage>
{
  public readonly messageType = IncomingMessageType.SEND_ROOM_MESSAGE;

  constructor(
    private readonly roomService: IRoomService,
    private readonly messageService: IMessageService,
  ) {}

  public async handle(
    socket: WebSocket,
    data: ISendMessageIncomingMessage,
    currentUser: UserInfo,
  ): Promise<void> {
    const room = this.roomService.getRoom(data.room);

    if (!room) {
      throw new Error(`Room ${data.room} not found`);
    }

    // Use the message service to handle message sending and storage
    const sent = this.messageService.sendRoomMessage(
      currentUser.id,
      data.room,
      data.message,
    );

    if (!sent) {
      throw new Error(`Failed to send message`);
    }

    // Send acknowledgment to the sender
    return sendSafe<IAcknowledgeOutgoingMessage>(socket, {
      id: data.id,
      type: OutgoingMessageType.ACK,
      message: 'Message sent',
    });
  }
}
