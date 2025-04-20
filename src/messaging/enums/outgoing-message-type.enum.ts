export enum OutgoingMessageType {
  ACK = 'ack',
  ERROR = 'error',

  USER_CONNECTED = 'user-connected',

  ROOM_MESSAGE = 'room-message',
  DIRECT_MESSAGE = 'direct-message', // TODO: is it needed

  ROOMS_LIST = 'rooms-list',
  ROOM_USERS_LIST = 'room-users-list',

  USERS_LIST = 'users-list',

  ROOM_MESSAGES_HISTORY = 'room-messages-history',
  DIRECT_MESSAGES_HISTORY = 'direct-messages-history',
}
