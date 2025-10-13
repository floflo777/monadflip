import { useEffect } from 'react';

const HISTORY_KEY = 'coinflip_history';

export const useGameHistory = (contract, account) => {
  useEffect(() => {
    if (!contract || !account) return;

    const saveToHistory = (gameId, winner, result, payout, event) => {
      try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
        
        const accountKey = account.toLowerCase();
        if (!history[accountKey]) {
          history[accountKey] = [];
        }

        const isWinner = winner.toLowerCase() === accountKey;
        
        const gameData = {
          gameId: gameId.toString(),
          isWinner,
          result: result ? 'Heads' : 'Tails',
          amount: payout.toString(),
          timestamp: Date.now(),
          txHash: event.log.transactionHash
        };

        // Éviter les doublons
        const existingIndex = history[accountKey].findIndex(g => g.txHash === gameData.txHash);
        if (existingIndex === -1) {
          history[accountKey] = [gameData, ...history[accountKey]].slice(0, 50);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
      } catch (error) {
        console.error('Error saving history:', error);
      }
    };

    contract.on('GameResolved', saveToHistory);

    return () => {
      contract.off('GameResolved', saveToHistory);
    };
  }, [contract, account]);
};

export const getLocalHistory = (account) => {
  if (!account) return [];
  
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return history[account.toLowerCase()] || [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};