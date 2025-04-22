# Chat Application

A real-time chat application with WebSocket communication.

## Setup and Running

### Prerequisites

- Node.js
- npm

### Server Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run start
   ```

3. Build and run:
   ```
   npm run start:prod
   ```

### Client Access

The WebSocket server runs on port 8080, but doesn't serve the HTML client directly. To access the client:

1. Start the server using one of the commands above
2. Open the HTML file directly in your browser:
   ```
   open public/index.html
   ```

## Dependencies

### Server

- **ws**: A simple WebSocket implementation for Node.js - chosen for its simplicity and performance
- **module-alias**: Provides path alias support for cleaner imports - allows using `@app/` instead of relative paths
- **uuid**: A library for generating unique ids for users, rooms, etc...

### Client

- Pure HTML/CSS/JavaScript - no external dependencies for the client to keep it lightweight

## Project Architecture

- WebSocket server handling real-time bidirectional communication
- In-memory data storage for users, rooms, and messages
- Service-based architecture with clear separation of concerns
- Message routing system for handling different types of incoming messages

## Developer Notes

I have made some assumptions through out the project development, so here I will list and arguement them.

1. Since there is no authentication, I opted for a one connection equals one user approach and server side id and username generation
2. I chose to handle subscriptions, listings and messages history over the WebSocket connection, because of the task. 
In a real-world application these operations can be handled over HTTP and leave only the real-time messaging over the socket.
3. The listings and message history do not support any kind of paging, this could lead to large data transfers, potentially causing performance issues.
4. No heatbeat mechanism for checking if the client socket is still "alive" is implemented for the task purpose.
5. Many other things should be improved in order for this app to be production ready and be able to scale and work flawlessly.
