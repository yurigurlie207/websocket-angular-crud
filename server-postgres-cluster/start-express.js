import { main } from './lib/index.js';

console.log('Starting Express server...');
main().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
