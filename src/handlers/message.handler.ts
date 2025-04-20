import { RawData, WebSocket } from 'ws';
import { sendSafe } from '@app/helpers';
import { IncomingMessageType, OutgoingMessageType } from '@app/enums';
import { MessageHandler, UserInfo } from '@app/types';
import { sendMessageHandler } from '@app/handlers/send-message.handler';
import { listRoomsHandler } from '@app/handlers/list-rooms.handler';
import { listUsersHandler } from '@app/handlers/list-users.handler';
import { subscribeHandler } from '@app/handlers/subscribe.handler';
import { unsubscribeHandler } from '@app/handlers/unsubscribe.handler';
import { roomService, usersService } from '@app/services';
import { IBaseIncomingMessage } from '@app/interfaces/messages';
import { roomHistoryHandler } from '@app/handlers/room-history.handler';
import { directMessageHandler } from '@app/handlers/direct-message.handler';
import { directHistoryHandler } from '@app/handlers/direct-history.handler';

// TODO: deal with any later
const actionHandlers: Partial<
  Record<IncomingMessageType, MessageHandler<any>>
> = {
  [IncomingMessageType.SEND_MESSAGE]: sendMessageHandler,
  [IncomingMessageType.LIST_ROOMS]: listRoomsHandler,
  [IncomingMessageType.LIST_USERS]: listUsersHandler,
  [IncomingMessageType.SUBSCRIBE]: subscribeHandler,
  [IncomingMessageType.UNSUBSCRIBE]: unsubscribeHandler,
  [IncomingMessageType.GET_HISTORY]: roomHistoryHandler,
  [IncomingMessageType.DIRECT_MESSAGE]: directMessageHandler,
  [IncomingMessageType.GET_DIRECT_HISTORY]: directHistoryHandler,
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
