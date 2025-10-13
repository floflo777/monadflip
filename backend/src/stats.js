import db from './db.js';
import { ethers } from 'ethers';

export function updateStats(gameData) {
  const { winner, payout, txHash, timestamp } = gameData;

  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
      UPDATE protocol_stats 
      SET 
        total_volume = (CAST(total_volume AS REAL) + ?)::TEXT,
        total_games = total_games + 1,
        last_updated = ?
      WHERE id = 1
    `);
    
    const payoutValue = parseFloat(ethers.formatEther(payout));
    stmt.run(payoutValue, timestamp);

    const insertPlayer = db.prepare(`
      INSERT OR IGNORE INTO players (address, first_seen) 
      VALUES (?, ?)
    `);
    insertPlayer.run(winner.toLowerCase(), timestamp);

    const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get().count;
    db.prepare('UPDATE protocol_stats SET total_players = ? WHERE id = 1').run(playerCount);
  });

  try {
    transaction();
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
}

export function addRecentGame(gameData) {
  const { gameId, winner, betAmount, payout, result, txHash, timestamp } = gameData;

  const transaction = db.transaction(() => {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO recent_games 
      (game_id, winner, bet_amount, payout, result, tx_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(
      gameId.toString(),
      winner.toLowerCase(),
      ethers.formatEther(betAmount),
      ethers.formatEther(payout),
      result ? 1 : 0,
      txHash,
      timestamp
    );

    const count = db.prepare('SELECT COUNT(*) as count FROM recent_games').get().count;
    if (count > 10) {
      db.prepare(`
        DELETE FROM recent_games 
        WHERE id IN (
          SELECT id FROM recent_games 
          ORDER BY timestamp ASC 
          LIMIT ?
        )
      `).run(count - 10);
    }
  });

  try {
    transaction();
  } catch (error) {
    if (!error.message.includes('UNIQUE constraint failed')) {
      console.error('Error adding recent game:', error);
    }
  }
}

export function addReferralReward(rewardData) {
  const { referrer, amount, gameId, txHash, timestamp } = rewardData;

  try {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO referral_rewards 
      (referrer, amount, game_id, tx_hash, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insert.run(
      referrer.toLowerCase(),
      ethers.formatEther(amount),
      gameId.toString(),
      txHash,
      timestamp
    );
  } catch (error) {
    if (!error.message.includes('UNIQUE constraint failed')) {
      console.error('Error adding referral reward:', error);
    }
  }
}

export function getStats() {
  const stats = db.prepare('SELECT * FROM protocol_stats WHERE id = 1').get();
  
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  
  const volume24h = db.prepare(`
    SELECT COALESCE(SUM(CAST(payout AS REAL)), 0) as volume
    FROM recent_games
    WHERE timestamp >= ?
  `).get(oneDayAgo).volume;

  const games24h = db.prepare(`
    SELECT COUNT(*) as count
    FROM recent_games
    WHERE timestamp >= ?
  `).get(oneDayAgo).count;

  return {
    volume24h: volume24h.toFixed(2),
    gamesToday: games24h,
    totalFlipped: parseFloat(stats.total_volume).toFixed(0),
    totalPlayers: stats.total_players
  };
}

export function getRecentGames() {
  const games = db.prepare(`
    SELECT game_id, winner, bet_amount, payout, result, tx_hash, timestamp
    FROM recent_games
    ORDER BY timestamp DESC
    LIMIT 10
  `).all();

  return games.map(g => ({
    gameId: g.game_id,
    winner: g.winner,
    betAmount: g.bet_amount,
    payout: g.payout,
    result: g.result === 1,
    txHash: g.tx_hash,
    timestamp: g.timestamp
  }));
}

export function getReferralStats(address) {
  const rewards = db.prepare(`
    SELECT 
      SUM(CAST(amount AS REAL)) as total,
      COUNT(*) as count
    FROM referral_rewards
    WHERE referrer = ?
  `).get(address.toLowerCase());

  const recentRewards = db.prepare(`
    SELECT amount, game_id, tx_hash, timestamp
    FROM referral_rewards
    WHERE referrer = ?
    ORDER BY timestamp DESC
    LIMIT 20
  `).all(address.toLowerCase());

  return {
    totalEarned: (rewards.total || 0).toFixed(6),
    gamesReferred: rewards.count || 0,
    recentRewards: recentRewards.map(r => ({
      amount: r.amount,
      gameId: r.game_id,
      txHash: r.tx_hash,
      timestamp: r.timestamp
    }))
  };
}