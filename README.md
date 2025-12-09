# MonadFlip

A decentralized peer-to-peer coin flip game built on the Monad blockchain. Players can create or join games, betting on heads or tails with transparent on-chain randomness.

## Features

- **Peer-to-Peer Betting**: Create games or join existing ones
- **On-Chain Randomness**: Fair coin flips using blockhash-based randomness
- **Referral System**: Earn 0.05% of game volume from referred players
- **Player Statistics**: Track wins, losses, and total volume
- **Protocol Analytics**: View global statistics and leaderboards
- **Responsive UI**: Modern interface with 3D coin animations

## Smart Contract

The `CoinFlip.sol` contract implements:

| Function | Description |
|----------|-------------|
| `createGame` | Create a new game with bet amount and duration |
| `joinGame` | Join an existing game and trigger resolution |
| `cancelGame` | Cancel your unjoined game and reclaim funds |
| `withdrawExpired` | Withdraw from expired unjoined games |

### Game Parameters

- **Minimum Bet**: 0.001 ETH
- **House Fee**: 0.10%
- **Referral Fee**: 0.05%
- **Duration**: 1 hour to 24 hours

### Security Features

- ReentrancyGuard protection
- Pausable by owner
- Emergency withdrawal function
- Input validation

## Tech Stack

**Smart Contracts:**
- Solidity 0.8.26
- OpenZeppelin Contracts
- Hardhat for development and testing

**Frontend:**
- React 18
- Vite
- TailwindCSS
- ethers.js v6
- Framer Motion
- React Three Fiber (3D coin)
- Zustand (state management)

## Installation

```bash
git clone git@github.com:floflo777/monadflip.git
cd monadflip/frontend
npm install
```

## Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Configure your environment variables:

```
PRIVATE_KEY=your_deployer_private_key
RPC_URL=your_monad_rpc_url
```

## Development

Start the frontend:

```bash
npm run dev
```

## Deployment

### Smart Contract

```bash
npx hardhat run scripts/deploy.cjs --network monad
```

### Frontend

```bash
npm run build
```

## Project Structure

```
monadflip/
└── frontend/
    ├── contracts/
    │   ├── CoinFlip.sol           # Main game contract
    │   └── interfaces/
    │       └── ICoinFlip.sol      # Contract interface
    ├── src/
    │   ├── components/
    │   │   ├── layout/            # Header, Footer, Ticker
    │   │   ├── activity/          # Live activity feed
    │   │   └── ui/                # Reusable UI components
    │   ├── context/
    │   │   └── Web3Context.jsx    # Wallet connection
    │   └── utils/
    │       ├── constants.js       # Contract addresses
    │       ├── formatting.js      # Display helpers
    │       └── referral.js        # Referral tracking
    ├── scripts/
    │   └── deploy.cjs             # Deployment script
    └── hardhat.config.cjs
```

## Contract Interface

```solidity
// Create a new game
function createGame(
    uint256 _betAmount,
    bool _choice,        // true = heads, false = tails
    uint256 _duration,   // in seconds (3600-86400)
    address _referrer
) external payable returns (uint256 gameId);

// Join and resolve a game
function joinGame(uint256 _gameId) external payable;

// Query functions
function getOpenGames() external view returns (uint256[] memory);
function getProtocolStats() external view returns (ProtocolStats memory);
function getPlayerStats(address _player) external view returns (PlayerStats memory);
```

## License

MIT
