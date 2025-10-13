export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const MONAD_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '0');
export const MONAD_EXPLORER = import.meta.env.VITE_MONAD_EXPLORER || '';
export const MONAD_FAUCET = import.meta.env.VITE_MONAD_FAUCET || '';

export const MIN_BET = '0.001';
export const DURATION_OPTIONS = [
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '12 hours', value: 43200 },
  { label: '24 hours', value: 86400 }
];

export const STAKE_CATEGORIES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Micro', min: 0.001, max: 0.01 },
  { label: 'Low', min: 0.01, max: 0.1 },
  { label: 'Medium', min: 0.1, max: 1 },
  { label: 'High', min: 1, max: Infinity }
];