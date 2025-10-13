import { useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useGameStore } from './useGameStore';
import { ethers } from 'ethers';

export const useGames = () => {
  const { contract, account, provider } = useWeb3();
  const { setGames, setMyGames, setLoading } = useGameStore();

  const loadGames = useCallback(async () => {
    const readContract = contract || provider?.contract;
    if (!readContract) return;

    setLoading(true);
    try {
      const openGameIds = await readContract.getOpenGames();
      
      const gamesData = await Promise.all(
        openGameIds.map(async (id) => {
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
        })
      );

      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
    setLoading(false);
  }, [contract, provider, setGames, setLoading]);

  const loadMyGames = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const myGameIds = await contract.getMyGames(account);
      
      const myGamesData = await Promise.all(
        myGameIds.map(async (id) => {
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
        })
      );

      setMyGames(myGamesData);
    } catch (error) {
      console.error('Error loading my games:', error);
    }
  }, [contract, account, setMyGames]);

  useEffect(() => {
    if (contract || provider?.contract) {
      loadGames();
      loadMyGames();

      if (contract) {
        const filterCreated = contract.filters.GameCreated();
        const filterJoined = contract.filters.GameJoined();
        const filterResolved = contract.filters.GameResolved();

        contract.on(filterCreated, () => {
          setTimeout(loadGames, 1000);
          setTimeout(loadMyGames, 1000);
        });

        contract.on(filterJoined, () => {
          setTimeout(loadGames, 1000);
          setTimeout(loadMyGames, 1000);
        });

        contract.on(filterResolved, () => {
          setTimeout(loadGames, 1000);
          setTimeout(loadMyGames, 1000);
        });

        return () => {
          contract.removeAllListeners(filterCreated);
          contract.removeAllListeners(filterJoined);
          contract.removeAllListeners(filterResolved);
        };
      }
    }
  }, [contract, provider, loadGames, loadMyGames]);

  return { loadGames, loadMyGames };
};