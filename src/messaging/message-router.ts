import { WebSocket } from 'ws';
import { UserInfo } from '@app/users/types';
import { RawData } from 'ws';
import { IncomingMessageType, OutgoingMessageType } from '@app/messaging/enums';
import { IMessageHandler } from '@app/messaging/interfaces/message-handler.interface';
import {
  IBaseIncomingMessage,
  IErrorOutgoingMessage,
} from '@app/messaging/interfaces';
import { sendSafe } from '@app/messaging/helpers';

/**
 * MessageRouter - manages message handlers and routes incoming messages
 * to the appropriate handler based on the message type
 */
export class MessageRouter {
  private handlers: Map<IncomingMessageType, IMessageHandler> = new Map();

  constructor(handlers?: IMessageHandler[]) {
    if (!handlers?.length) {
      return;
    }

    this.registerHandlers(handlers);
  }

  /**
   * Register handlers
   */
  public registerHandlers(handlers: IMessageHandler[]): void {
    for (const handler of handlers) {
      this.handlers.set(handler.messageType, handler);
      console.log(
        `Registered handler for message type: ${handler.messageType}`,
      );
    }
  }

  /**
   * Get all registered handlers
   */
  public getHandlers(): IMessageHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Process an incoming WebSocket message and route it to the appropriate handler
   */
  public async processMessage(
    socket: WebSocket,
    rawData: RawData,
    user: UserInfo,
  ): Promise<void> {
    console.log(`Processing message from user ${user.id} (${user.username})`);

    let message: IBaseIncomingMessage;

    // Parse message
    try {
      message = JSON.parse(rawData.toString());

      // Validate message ID
      if (!message.id) {
        return sendSafe(socket, {
          type: OutgoingMessageType.ERROR,
          id: 'unknown',
          message: 'Missing message ID',
        } as IErrorOutgoingMessage);
      }
    } catch (error) {
      return sendSafe(socket, {
        type: OutgoingMessageType.ERROR,
        id: 'unknown',
        message: 'Invalid message format',
      } as IErrorOutgoingMessage);
    }

    // Route to appropriate handler
    try {
      const handler = this.handlers.get(message.type as IncomingMessageType);

      if (!handler) {
        console.warn(`No handler registered for message type: ${message.type}`);

        return sendSafe(socket, {
          type: OutgoingMessageType.ERROR,
          id: message.id,
          message: `Unknown message type: ${message.type}`,
        } as IErrorOutgoingMessage);
      }

      // Handle the message
      await handler.handle(socket, message, user);
    } catch (error) {
      console.error(`Error handling message: ${error}`);

      return sendSafe(socket, {
        type: OutgoingMessageType.ERROR,
        id: message.id,
        message:
          (error as Error).message ||
          'An error occurred processing your request',
      } as IErrorOutgoingMessage);
    }
  }
}
