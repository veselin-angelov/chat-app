export enum IncomingMessageType {
  // PING = 'ping',
  // PONG = 'pong',
  SEND_MESSAGE = 'send-message',
  LIST_ROOMS = 'list-rooms',
  LIST_USERS = 'list-users',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  GET_HISTORY = 'get-history',
  DIRECT_MESSAGE = 'direct-message', // TODO: is it needed
  GET_DIRECT_HISTORY = 'get-direct-history',
}
