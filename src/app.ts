import { WebSocketServer } from 'ws';
import { MessageRouter } from '@app/messaging/message-router';
import {
  DirectMessageHandler,
  DirectMessageHistoryHandler,
  ListRoomsHandler,
  ListRoomUsersHandler,
  ListUsersHandler,
  RoomMessagesHistoryHandler,
  SendRoomMessageHandler,
  SubscribeHandler,
  UnsubscribeHandler,
} from '@app/messaging/handlers';
import {
  IMessagesStorage,
  IRoomsStorage,
  IUsersStorage,
} from '@app/storage/interfaces';
import {
  MessagesStorage,
  RoomsStorage,
  UsersStorage,
} from '@app/storage/memory';
import { IRoomService } from '@app/rooms/interfaces';
import { RoomService } from '@app/rooms/services';
import { ISubscriptionService } from '@app/subscriptions/interfaces';
import { SubscriptionService } from '@app/subscriptions/services';
import { IUserService } from '@app/users/interfaces';
import { UserService } from '@app/users/services';
import { IMessageService } from '@app/messaging/interfaces';
import { MessageService } from '@app/messaging/services';
import { ConnectionHandler } from '@app/connections/handlers';

/**
 * Initialize the application
 */
export function initializeApp() {
  console.log('Initializing application...');

  // Fake dependency injection
  const usersStorage: IUsersStorage = new UsersStorage();
  const roomsStorage: IRoomsStorage = new RoomsStorage();
  const messagesStorage: IMessagesStorage = new MessagesStorage();

  const roomService: IRoomService = new RoomService(roomsStorage);

  const subscriptionService: ISubscriptionService = new SubscriptionService(
    usersStorage,
    roomsStorage,
  );

  const userService: IUserService = new UserService(
    usersStorage,
    subscriptionService,
  );

  const messageService: IMessageService = new MessageService(
    messagesStorage,
    userService,
    roomService,
    subscriptionService,
  );

  // Create message router
  const messageRouter = new MessageRouter([
    new DirectMessageHandler(userService, messageService),
    new DirectMessageHistoryHandler(userService, messageService),
    new ListRoomUsersHandler(roomService, subscriptionService),
    new ListRoomsHandler(roomService),
    new ListUsersHandler(userService),
    new RoomMessagesHistoryHandler(roomService, messageService),
    new SendRoomMessageHandler(roomService, messageService),
    new SubscribeHandler(roomService, subscriptionService),
    new UnsubscribeHandler(roomService, subscriptionService),
  ]);

  // Create connection handler
  const connectionHandler = new ConnectionHandler(userService, messageRouter);

  // Create and start a WebSocket server
  const wss = new WebSocketServer({ port: 8080 });
  console.log('WebSocket server started on port 8080');

  // Set up connection handler
  wss.on('connection', (socket) => connectionHandler.handleConnection(socket));

  return wss;
}
