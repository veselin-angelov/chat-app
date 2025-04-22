export enum IncomingMessageType {
  SEND_ROOM_MESSAGE = 'send-room-message',
  SEND_DIRECT_MESSAGE = 'send-direct-message',

  LIST_ROOMS = 'list-rooms',
  LIST_ROOM_USERS = 'list-room-users',

  LIST_USERS = 'list-users',

  FETCH_ROOM_MESSAGES_HISTORY = 'fetch-room-messages-history',
  FETCH_DIRECT_MESSAGE_HISTORY = 'fetch-direct-message-history',

  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}
