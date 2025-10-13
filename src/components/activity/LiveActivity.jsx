import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { shortAddress, formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';

export default function LiveActivity() {
  const { contract } = useWeb3();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!contract) return;

    const handleGameResolved = (gameId, winner, result, payout, event) => {
      try {
        // Convertir proprement les valeurs
        const newActivity = {
          id: event.log.transactionHash,
          winner: winner.toString(),
          amount: ethers.formatEther(payout.toString()),
          choice: result ? 'Heads' : 'Tails',
          timestamp: Date.now()
        };

        setActivities(prev => {
          if (prev.find(a => a.id === newActivity.id)) return prev;
          return [newActivity, ...prev].slice(0, 10);
        });
      } catch (error) {
        // Ignore silencieusement les erreurs de parsing
      }
    };

    contract.on('GameResolved', handleGameResolved);

    return () => {
      contract.off('GameResolved', handleGameResolved);
    };
  }, [contract]);

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <h3 className="text-xl font-bold text-primary">Live Activity</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Waiting for games to complete...
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-50 rounded-lg p-3 border-l-4 border-accent animate-fadeIn"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-semibold">↑</span>
                    <span className="text-sm font-semibold text-primary">
                      {shortAddress(activity.winner)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Won {formatAmount(activity.amount)} MON
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.choice} · {getTimeAgo(activity.timestamp)}
                  </div>
                </div>
                {parseFloat(activity.amount) >= 10 && (
                  <span className="text-lg">🔥</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}