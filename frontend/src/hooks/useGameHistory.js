import { useEffect } from 'react';
import { ethers } from 'ethers';

const HISTORY_KEY = 'coinflip_history_v2';

export const useGameHistory = (contract, account) => {
  useEffect(() => {
    if (!contract || !account) return;

    console.log('Setting up GameResolved listener for:', account);

    const handleGameResolved = async (...args) => {
      try {
        const event = args[args.length - 1];
        
        const gameId = args[0];
        const winner = args[1];
        const result = args[2];
        const payout = args[3];
        
        console.log('GameResolved event received:', {
          gameId: gameId.toString(),
          winner,
          result,
          payout: ethers.formatEther(payout)
        });

        const winnerLower = winner.toLowerCase();
        const accountLower = account.toLowerCase();
        
        const game = await contract.getGame(gameId);
        const player1Lower = game.player1.toLowerCase();
        const player2Lower = game.player2.toLowerCase();
        
        if (accountLower !== player1Lower && accountLower !== player2Lower) {
          console.log('Account not involved in this game, skipping');
          return;
        }

        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
        
        if (!history[accountLower]) {
          history[accountLower] = [];
        }

        const isWinner = winnerLower === accountLower;
        
        const gameData = {
          gameId: gameId.toString(),
          isWinner,
          result: result ? 'Heads' : 'Tails',
          amount: payout.toString(),
          timestamp: Date.now(),
          txHash: event.log.transactionHash
        };

        const existingIndex = history[accountLower].findIndex(g => g.txHash === gameData.txHash);
        if (existingIndex === -1) {
          history[accountLower] = [gameData, ...history[accountLower]].slice(0, 50);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
          console.log(' Game saved to history:', gameData);
        } else {
          console.log('Game already in history');
        }
      } catch (error) {
        console.error(' Error saving history:', error);
      }
    };

    contract.on('GameResolved', handleGameResolved);

    return () => {
      console.log('Removing GameResolved listener');
      contract.off('GameResolved', handleGameResolved);
    };
  }, [contract, account]);
};

export const getLocalHistory = (account) => {
  if (!account) return [];
  
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    const userHistory = history[account.toLowerCase()] || [];
    console.log('Loading history for', account, ':', userHistory.length, 'games');
    return userHistory;
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const migrateHistory = () => {
  const oldKey = 'coinflip_history';
  const newKey = 'coinflip_history_v2';
  
  try {
    const oldHistory = localStorage.getItem(oldKey);
    if (oldHistory && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldHistory);
    }
    localStorage.removeItem(oldKey);
    console.log('History migrated');
  } catch (error) {
    console.error('Migration error:', error);
  }
};