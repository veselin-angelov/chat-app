import { WebSocket } from 'ws';
import { sendSafe } from '@app/messaging/helpers';
import { OutgoingMessageType } from '@app/messaging/enums';
import { IUserConnectedOutgoingMessage } from '@app/messaging/interfaces';
import { IUserService } from '@app/users/interfaces';
import { MessageRouter } from '@app/messaging/message-router';

/**
 * Handler for new WebSocket connections
 * Creates a new user and sets up event handlers
 */
export class ConnectionHandler {
  constructor(
    private readonly userService: IUserService,
    private readonly messageRouter: MessageRouter,
  ) {}

  /**
   * Handle a new WebSocket connection
   * @param socket The WebSocket connection
   */
  public async handleConnection(socket: WebSocket): Promise<void> {
    // Create a new user
    const currentUser = this.userService.createUser(socket);

    console.log(
      `Client connected: ${currentUser.id} (${currentUser.username})`,
    );

    // Send the user info to the client
    sendSafe<IUserConnectedOutgoingMessage>(socket, {
      id: null as any, // not responding to any message yet
      type: OutgoingMessageType.USER_CONNECTED,
      user: {
        id: currentUser.id,
        username: currentUser.username,
      },
    });

    // Set up event handlers for the socket
    socket.on('message', async (data) => {
      await this.messageRouter.processMessage(socket, data, currentUser);
    });

    socket.on('error', (error) => this.handleError(error));
    socket.on('close', () => this.handleClose(currentUser.id));
  }

  /**
   * Handle WebSocket errors
   * @param error The error
   */
  private handleError(error: Error): void {
    console.error(`WebSocket error: ${error.message}`);
  }

  /**
   * Handle WebSocket connection close
   * @param userId The ID of the user whose connection closed
   */
  private handleClose(userId: string): void {
    console.log(`Client disconnected: ${userId}`);
    this.userService.removeUser(userId);
  }
}
