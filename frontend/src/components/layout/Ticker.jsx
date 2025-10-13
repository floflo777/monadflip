import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/constants';
import { shortAddress } from '../../utils/formatting';

export default function Ticker() {
  const [stats, setStats] = useState({
    volume24h: '0',
    gamesToday: 0,
    totalFlipped: '0',
    totalPlayers: 0
  });
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/api/stats`),
        fetch(`${API_URL}/api/live-activity`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (gamesRes.ok) {
        const data = await gamesRes.json();
        setRecentGames(data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading ticker data:', error);
    }
  };

  const tickerItems = [
    `24h Volume: ${stats.volume24h} MON`,
    `Games Today: ${stats.gamesToday}`,
    `Total Flipped: ${stats.totalFlipped} MON`,
    `Players: ${stats.totalPlayers}`,
    ...recentGames.map(game => 
      `Last Win: ${shortAddress(game.winner)} won ${parseFloat(game.payout).toFixed(3)} MON`
    )
  ];

  return (
    <div className="glass border-y border-white/10 overflow-hidden py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div key={index} className="inline-flex items-center mx-8">
            <span className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse"></span>
            <span className="text-white font-semibold">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}