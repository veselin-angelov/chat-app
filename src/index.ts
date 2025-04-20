import 'module-alias/register';
import { initializeApp } from '@app/app';

// Initialize the application
const server = initializeApp();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});
