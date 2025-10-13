import { useCallback, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useGameStore } from './useGameStore';
import { ethers } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const useGames = () => {
  const { contract, account, provider } = useWeb3();
  const { setGames, setMyGames, setLoading } = useGameStore();
  
  const isLoadingGames = useRef(false);
  const isLoadingMyGames = useRef(false);

  const loadGames = useCallback(async () => {
    if (isLoadingGames.current) {
      console.log('loadGames already in progress');
      return;
    }

    const readContract = contract || provider?.contract;
    if (!readContract) return;

    isLoadingGames.current = true;
    setLoading(true);

    try {
      const openGameIds = await readContract.getOpenGames();
      
      if (openGameIds.length === 0) {
        setGames([]);
        return;
      }

      const gamesData = await Promise.all(
        openGameIds.map(async (id) => {
          try {
            const game = await readContract.getGame(id);
            return {
              gameId: id.toString(),
              player1: game.player1,
              player2: game.player2,
              betAmount: ethers.formatEther(game.betAmount),
              winner: game.winner,
              createTime: Number(game.createTime),
              expirationTime: Number(game.expirationTime),
              player1Choice: game.player1Choice,
              referrer: game.referrer,
              resolved: game.resolved
            };
          } catch (err) {
            console.error(`Error loading game ${id}:`, err.message);
            return null;
          }
        })
      );

      const validGames = gamesData.filter(g => g !== null);

      const openGames = validGames.filter(g => 
        g.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase() && !g.resolved
      );

      setGames(openGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
      isLoadingGames.current = false;
    }
  }, [contract, provider, setGames, setLoading]);

  const loadMyGames = useCallback(async () => {
    if (!contract || !account) return;

    if (isLoadingMyGames.current) {
      console.log('loadMyGames already in progress');
      return;
    }

    isLoadingMyGames.current = true;

    try {
      const myGameIds = await contract.getMyGames(account);
      
      if (myGameIds.length === 0) {
        setMyGames([]);
        return;
      }

      const myGamesData = await Promise.all(
        myGameIds.map(async (id) => {
          try {
            const game = await contract.getGame(id);
            return {
              gameId: id.toString(),
              player1: game.player1,
              player2: game.player2,
              betAmount: ethers.formatEther(game.betAmount),
              winner: game.winner,
              createTime: Number(game.createTime),
              expirationTime: Number(game.expirationTime),
              player1Choice: game.player1Choice,
              referrer: game.referrer,
              resolved: game.resolved
            };
          } catch (err) {
            console.error(`Error loading my game ${id}:`, err.message);
            return null;
          }
        })
      );

      const validMyGames = myGamesData.filter(g => g !== null);
      setMyGames(validMyGames);
    } catch (error) {
      console.error('Error loading my games:', error);
    } finally {
      isLoadingMyGames.current = false;
    }
  }, [contract, account, setMyGames]);

  return { loadGames, loadMyGames };
};