import { useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useGameStore } from './useGameStore';
import { ethers } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const useGames = () => {
  const { contract, account, provider } = useWeb3();
  const { setGames, setMyGames, setLoading } = useGameStore();

  const loadGames = useCallback(async () => {
    const readContract = contract || provider?.contract;
    if (!readContract) return;

    setLoading(true);

    try {
      console.log('Loading games with pagination...');
      
      // Utiliser la nouvelle fonction optimisée
      const [gamesData, totalCount] = await readContract.getOpenGamesWithData(1000, 0);
      
      console.log(`Loaded ${gamesData.length} games out of ${totalCount} total`);

      const openGames = gamesData.map(game => ({
        gameId: game.gameId ? game.gameId.toString() : '0',
        player1: game.player1,
        player2: game.player2,
        betAmount: ethers.formatEther(game.betAmount),
        winner: game.winner,
        createTime: Number(game.createTime),
        expirationTime: Number(game.expirationTime),
        player1Choice: game.player1Choice,
        referrer: game.referrer,
        resolved: game.resolved
      }));

      setGames(openGames);
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [contract, provider, setGames, setLoading]);

  const loadMyGames = useCallback(async () => {
    if (!contract || !account) return;

    try {
      console.log('Loading my games with pagination...');
      
      // Utiliser la nouvelle fonction optimisée
      const [myGamesData, totalCount] = await contract.getMyGamesWithData(account, 1000, 0);
      
      console.log(`Loaded ${myGamesData.length} of my games out of ${totalCount} total`);

      const myGames = myGamesData.map(game => ({
        gameId: game.gameId ? game.gameId.toString() : '0',
        player1: game.player1,
        player2: game.player2,
        betAmount: ethers.formatEther(game.betAmount),
        winner: game.winner,
        createTime: Number(game.createTime),
        expirationTime: Number(game.expirationTime),
        player1Choice: game.player1Choice,
        referrer: game.referrer,
        resolved: game.resolved
      }));

      setMyGames(myGames);
    } catch (error) {
      console.error('Error loading my games:', error);
      setMyGames([]);
    }
  }, [contract, account, setMyGames]);

  return { loadGames, loadMyGames };
};