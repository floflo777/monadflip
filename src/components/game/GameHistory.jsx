import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { getLocalHistory } from '../../hooks/useGameHistory';
import { formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';
import { MONAD_EXPLORER } from '../../utils/constants';

export default function GameHistory() {
  const { account } = useWeb3();
  
  if (!account) {
    return null;
  }

  const history = getLocalHistory(account);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-xl font-bold text-primary mb-4">📜 Recent Games</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((game) => {
          let amount = '0';
          try {
            amount = formatAmount(ethers.formatEther(game.amount));
          } catch (e) {
            amount = '0';
          }

          return (
            <div
              key={game.txHash}
              className={`p-3 rounded-lg text-sm ${
                game.isWinner ? 'bg-accent/10 border border-accent/30' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className={`font-semibold ${game.isWinner ? 'text-accent' : 'text-gray-600'}`}>
                    {game.isWinner ? '✨ Won' : '◐ Lost'}
                  </span>
                  <span className="ml-2 text-primary font-semibold">
                    {amount} MON
                  </span>
                </div>
                {MONAD_EXPLORER && (<a
                  
                    href={`${MONAD_EXPLORER}/tx/${game.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-accent"
                  >
                    View ↗
                  </a>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {game.result} · {new Date(game.timestamp).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}