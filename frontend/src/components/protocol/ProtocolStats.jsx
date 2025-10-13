import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/constants';

export default function ProtocolStats() {
  const [stats, setStats] = useState({
    volume24h: '0',
    gamesToday: 0,
    totalFlipped: '0',
    totalPlayers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-primary/5 border border-accent/20 rounded-lg px-6 py-3 mb-6">
        <div className="flex items-center justify-center text-sm text-primary">
          Loading stats...
        </div>
      </div>
    );
  }

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