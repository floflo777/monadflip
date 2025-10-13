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
    "event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount, bool player1Choice, uint256 expirationTime, address referrer, uint256 timestamp)",
    "event GameJoined(uint256 indexed gameId, address indexed player2, uint256 timestamp)",
    "event GameResolved(uint256 indexed gameId, address indexed winner, bool result, uint256 payout, uint256 timestamp)",
    "event GameCancelled(uint256 indexed gameId, address indexed player1, uint256 timestamp)",
    "event GameExpired(uint256 indexed gameId, uint256 timestamp)",
    "event ReferralReward(address indexed referrer, uint256 amount, uint256 indexed gameId, uint256 timestamp)"
  ]
};