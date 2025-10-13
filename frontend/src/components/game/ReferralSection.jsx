import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { API_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ReferralSection() {
  const { account } = useWeb3();
  const [stats, setStats] = useState({
    totalEarned: '0',
    gamesReferred: 0
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (account) {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }
  }, [account]);

  const loadStats = async () => {
    if (!account) return;

    try {
      const response = await fetch(`${API_URL}/api/referral/${account}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const copyReferralLink = () => {
    if (!account) return;

    const link = `${window.location.origin}?ref=${account}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');

    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold text-primary mb-4">Share & Earn</h3>

      <div className="glass rounded-lg p-4 mb-4 border border-accent/20">
        <p className="text-sm text-primary font-semibold mb-2">Your Earnings</p>
        <p className="text-3xl font-bold text-primary mb-1">
          {parseFloat(stats.totalEarned).toFixed(4)} MON
        </p>
        <p className="text-xs text-gray-600">
          From {stats.gamesReferred} {stats.gamesReferred === 1 ? 'game' : 'games'}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Your referral link:</p>
        <div className="glass rounded-lg p-3 text-xs break-all text-primary font-mono">
          {window.location.origin}?ref={account.slice(0, 10)}...
        </div>
      </div>

      <button
        onClick={copyReferralLink}
        className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {copied ? 'Link Copied!' : 'Copy Referral Link'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Earn 0.05% when someone uses your link
      </p>
    </div>
  );
}