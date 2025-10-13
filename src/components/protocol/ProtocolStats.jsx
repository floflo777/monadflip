import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { ethers } from 'ethers';

export default function ProtocolStats() {
  const { contract } = useWeb3();
  const [stats, setStats] = useState({
    volume24h: '0',
    gamesToday: 0,
    totalFlipped: '0',
    totalPlayers: 0
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [contract]);

  const loadStats = async () => {
    if (!contract) return;

    try {
      const now = Math.floor(Date.now() / 1000);
      const oneDayAgo = now - 86400;

      // Récupérer les events des dernières 24h
      const filterResolved = contract.filters.GameResolved();
      const events = await contract.queryFilter(filterResolved, -6000); // ~24h de blocs (approximatif)

      let volume24h = 0;
      let gamesToday = 0;
      const players = new Set();

      for (const event of events) {
        try {
          const block = await event.getBlock();
          
          // Si dans les dernières 24h
          if (block.timestamp >= oneDayAgo) {
            // Volume = somme des payouts
            const payout = event.args[3]; // args[3] = payout
            volume24h += parseFloat(ethers.formatEther(payout));
            gamesToday++;

            // Récupérer le game pour compter les joueurs
            const gameId = event.args[0];
            const game = await contract.getGame(gameId);
            players.add(game.player1.toLowerCase());
            players.add(game.player2.toLowerCase());
          }
        } catch (err) {
          console.error('Error processing event:', err);
        }
      }

      // Total flipped = tous les events
      let totalFlipped = 0;
      for (const event of events) {
        try {
          const payout = event.args[3];
          totalFlipped += parseFloat(ethers.formatEther(payout));
        } catch (err) {
          // ignore
        }
      }

      setStats({
        volume24h: volume24h.toFixed(1),
        gamesToday,
        totalFlipped: totalFlipped.toFixed(0),
        totalPlayers: players.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Garder les valeurs par défaut en cas d'erreur
    }
  };

  return (
    <div className="bg-primary/5 border border-accent/20 rounded-lg px-6 py-3 mb-6">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-8">
          <div>
            <span className="text-primary/60">24h Volume:</span>
            <span className="ml-2 font-bold text-primary">{stats.volume24h} MON</span>
          </div>
          <div>
            <span className="text-primary/60">Games Today:</span>
            <span className="ml-2 font-bold text-primary">{stats.gamesToday}</span>
          </div>
          <div className="hidden md:block">
            <span className="text-primary/60">Total Flipped:</span>
            <span className="ml-2 font-bold text-primary">{stats.totalFlipped} MON</span>
          </div>
          <div className="hidden md:block">
            <span className="text-primary/60">Players:</span>
            <span className="ml-2 font-bold text-primary">{stats.totalPlayers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}