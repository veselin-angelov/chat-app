import {
  IMessagesStorage,
  IRoomsStorage,
  IUsersStorage,
} from '@app/storage/interfaces';
import { SubscriptionService } from '@app/subscriptions/services';
import { UserService } from '@app/users/services';
import { RoomService } from '@app/rooms/services';
import { MessageService } from '@app/messaging/services';

// Service instances
export let subscriptionService: SubscriptionService;
export let usersService: UserService;
export let roomService: RoomService;
export let messageService: MessageService;

/**
 * Initialize all services with their dependencies
 * This function should be called once at application startup
 * @param usersStorage The users storage implementation
 * @param roomsStorage The rooms storage implementation
 * @param messagesStorage The messages storage implementation
 */
export function initializeServices(
  usersStorage: IUsersStorage,
  roomsStorage: IRoomsStorage,
  messagesStorage: IMessagesStorage,
): void {
  subscriptionService = new SubscriptionService(usersStorage, roomsStorage);

  usersService = new UserService(
    usersStorage,
    roomsStorage,
    subscriptionService,
  );

  roomService = new RoomService(
    roomsStorage,
    usersStorage,
    subscriptionService,
  );

  messageService = new MessageService(
    usersStorage,
    roomsStorage,
    subscriptionService,
    messagesStorage,
  );
}
