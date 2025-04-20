import {
  IRoomsStorage,
  IUsersStorage,
  IMessagesStorage,
} from '@app/interfaces/storage';
import { SubscriptionService } from '@app/services/subscription.service';
import { UserService } from '@app/services/user.service';
import { RoomService } from '@app/services/room.service';
import { MessageService } from '@app/services/message.service';

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
