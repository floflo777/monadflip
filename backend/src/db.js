import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, '..', 'database');
const dbPath = join(dbDir, 'coinflip.db');

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS protocol_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_volume TEXT DEFAULT '0',
    total_games INTEGER DEFAULT 0,
    total_players INTEGER DEFAULT 0,
    last_updated INTEGER,
    CHECK (id = 1)
  );

  INSERT OR IGNORE INTO protocol_stats (id, total_volume, total_games, total_players)
  VALUES (1, '0', 0, 0);

  CREATE TABLE IF NOT EXISTS daily_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    volume TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_daily_metrics_timestamp ON daily_metrics(timestamp DESC);

  CREATE TABLE IF NOT EXISTS recent_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    winner TEXT NOT NULL,
    bet_amount TEXT NOT NULL,
    payout TEXT NOT NULL,
    result INTEGER NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS players (
    address TEXT PRIMARY KEY,
    first_seen INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS referral_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer TEXT NOT NULL,
    amount TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_referrer ON referral_rewards(referrer);
  CREATE INDEX IF NOT EXISTS idx_recent_games_timestamp ON recent_games(timestamp DESC);
`);

console.log('Database initialized');

export default db;