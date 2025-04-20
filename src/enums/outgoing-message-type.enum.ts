export enum OutgoingMessageType {
  ACK = 'ack',
  ERROR = 'error',
  USER_CONNECTED = 'user-connected',
  MESSAGE = 'message',
  ROOMS_LIST = 'rooms-list',
  USERS_LIST = 'users-list',
  ROOM_HISTORY = 'room-history',
  DIRECT_MESSAGE = 'direct-message', // TODO: is it needed
  DIRECT_HISTORY = 'direct-history',
}
