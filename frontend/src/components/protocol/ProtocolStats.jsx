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
      <div className="glass-card rounded-2xl px-6 py-4 mb-6">
        <div className="flex items-center justify-center text-sm text-primary">
          Loading stats...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card rounded-2xl p-6">
        <div className="text-sm text-gray-600 mb-1">24h Volume</div>
        <div className="text-2xl font-bold text-accent">{stats.volume24h} MON</div>
      </div>
      
      <div className="glass-card rounded-2xl p-6">
        <div className="text-sm text-gray-600 mb-1">Games Today</div>
        <div className="text-2xl font-bold text-primary">{stats.gamesToday}</div>
      </div>
      
      <div className="glass-card rounded-2xl p-6">
        <div className="text-sm text-gray-600 mb-1">Total Flipped</div>
        <div className="text-2xl font-bold text-accent">{stats.totalFlipped} MON</div>
      </div>
      
      <div className="glass-card rounded-2xl p-6">
        <div className="text-sm text-gray-600 mb-1">Total Players</div>
        <div className="text-2xl font-bold text-primary">{stats.totalPlayers}</div>
      </div>
    </div>
  );
}