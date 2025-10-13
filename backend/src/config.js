import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

export default {
  rpcUrl: process.env.RPC_URL,
  contractAddress: process.env.CONTRACT_ADDRESS,
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  contractABI: [
    "event GameResolved(uint256 indexed gameId, address indexed winner, bool result, uint256 payout)",
    "event ReferralReward(address indexed referrer, uint256 amount, uint256 indexed gameId)"
  ]
};