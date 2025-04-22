// Setup path aliases
import { addAliases } from 'module-alias';
addAliases({
  '@app': __dirname,
});

import { initializeApp } from '@app/app';

// Initialize the application
const wss = initializeApp();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.terminate();
  });

  wss.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });

  // Forcefully exit after timeout if server doesn't close gracefully
  setTimeout(() => {
    console.log('Forcing server shutdown after timeout');
    process.exit(1);
  }, 5000);
});
