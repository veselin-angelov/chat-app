import { RawData, WebSocket } from 'ws';
import { sendSafe } from '@app/messaging/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { UserInfo } from '@app/users/types';
import { sendMessageHandler } from '@app/messaging/handlers/send-message.handler';
import { subscribeHandler } from '@app/messaging/handlers/subscribe.handler';
import { unsubscribeHandler } from '@app/messaging/handlers/unsubscribe.handler';
import { roomService, usersService } from '@app/services';
import { IBaseIncomingMessage } from '@app/messaging/interfaces';
import { roomMessagesHistoryHandler } from '@app/messaging/handlers/room-messages-history.handler';
import { directMessageHandler } from '@app/messaging/handlers/direct-message.handler';
import { directMessageHistoryHandler } from '@app/messaging/handlers/direct-message-history.handler';
import { MessageHandler } from '@app/messaging/types';
import { listRoomsHandler } from '@app/messaging/handlers/list-rooms.handler';
import { listRoomUsersHandler } from '@app/messaging/handlers/list-room-users.handler';
import { listUsersHandler } from '@app/messaging/handlers/list-users.handler';

// TODO: deal with any later
const actionHandlers: Record<IncomingMessageType, MessageHandler<any>> = {
  [IncomingMessageType.SEND_ROOM_MESSAGE]: sendMessageHandler,
  [IncomingMessageType.LIST_ROOMS]: listRoomsHandler,
  [IncomingMessageType.LIST_ROOM_USERS]: listRoomUsersHandler,
  [IncomingMessageType.SUBSCRIBE]: subscribeHandler,
  [IncomingMessageType.UNSUBSCRIBE]: unsubscribeHandler,
  [IncomingMessageType.FETCH_ROOM_MESSAGES_HISTORY]: roomMessagesHistoryHandler,
  [IncomingMessageType.SEND_DIRECT_MESSAGE]: directMessageHandler,
  [IncomingMessageType.FETCH_DIRECT_MESSAGE_HISTORY]:
    directMessageHistoryHandler,
  [IncomingMessageType.LIST_USERS]: listUsersHandler,
};

export const messageHandler =
  (socket: WebSocket, currentUser: UserInfo) =>
  (rawData: RawData, isBinary: boolean) => {
    console.log(
      rawData.toString(),
      isBinary,
      currentUser.id,
      currentUser.username,
    );
    console.log(usersService.getAllUsers());
    console.log(roomService.getAllRooms());

    let data: IBaseIncomingMessage;

    try {
      data = JSON.parse(rawData.toString());

      if (!data.id) {
        return sendSafe(socket, {
          type: OutgoingMessageType.ERROR,
          id: 'unknown',
          message: 'Missing message id',
        });
      }
    } catch (err) {
      return sendSafe(socket, {
        type: OutgoingMessageType.ERROR,
        id: 'unknown',
        message: 'Invalid message format',
      });
    }

    try {
      const handler = actionHandlers[data.type];

      if (!handler) {
        return sendSafe(socket, {
          type: OutgoingMessageType.ERROR,
          id: data.id,
          message: 'Unknown action',
        });
      }

      handler(socket, data, currentUser);
    } catch (err) {
      return sendSafe(socket, {
        type: OutgoingMessageType.ERROR,
        id: data.id,
        message: (err as Error).message,
      });
    }

    console.log(usersService.getAllUsers());
    console.log(roomService.getAllRooms());
  };
