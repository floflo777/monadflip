import express from 'express';
import cors from 'cors';
import config from './config.js';
import { getStats, getRecentGames, getReferralStats } from './stats.js';
import { getProvider } from './listener.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      status: 'ok',
      blockNumber,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/live-activity', (req, res) => {
  try {
    const games = getRecentGames();
    res.json(games);
  } catch (error) {
    console.error('Error getting recent games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/referral/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const stats = getReferralStats(address);
    res.json(stats);
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function startAPI() {
  app.listen(config.port, () => {
    console.log(`API server running on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });
}

export default app;