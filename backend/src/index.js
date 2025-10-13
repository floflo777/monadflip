import './db.js';
import { startListener } from './listener.js';
import { startAPI } from './api.js';

async function main() {
  console.log('Starting MonadFlip Backend...\n');

  try {
    await startListener();
    startAPI();
    console.log('\nBackend ready!\n');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

main();