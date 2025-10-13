import { useCallback, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useGameStore } from './useGameStore';
import { ethers } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const useGames = () => {
  const { contract, account, provider } = useWeb3();
  const { setGames, setMyGames, setLoading } = useGameStore();
  
  const abortControllerGames = useRef(null);
  const abortControllerMyGames = useRef(null);

  const loadGames = useCallback(async () => {
    // Annuler l'appel précédent s'il existe
    if (abortControllerGames.current) {
      console.log('Cancelling previous loadGames');
      abortControllerGames.current.abort();
    }

    abortControllerGames.current = new AbortController();

    const readContract = contract || provider?.contract;
    if (!readContract) return;

    setLoading(true);

    try {
      const openGameIds = await readContract.getOpenGames();
      
      if (abortControllerGames.current.signal.aborted) return;

      if (openGameIds.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }

      console.log(`Loading ${openGameIds.length} games...`);

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

      if (abortControllerGames.current.signal.aborted) return;

      const validGames = gamesData.filter(g => g !== null);

      const openGames = validGames.filter(g => 
        g.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase() && !g.resolved
      );

      console.log(`Loaded ${openGames.length} open games out of ${openGameIds.length} total`);
      setGames(openGames);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('loadGames was aborted');
        return;
      }
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
      abortControllerGames.current = null;
    }
  }, [contract, provider, setGames, setLoading]);

  const loadMyGames = useCallback(async () => {
    if (!contract || !account) return;

    // Annuler l'appel précédent s'il existe
    if (abortControllerMyGames.current) {
      console.log('Cancelling previous loadMyGames');
      abortControllerMyGames.current.abort();
    }

    abortControllerMyGames.current = new AbortController();

    try {
      const myGameIds = await contract.getMyGames(account);
      
      if (abortControllerMyGames.current.signal.aborted) return;

      if (myGameIds.length === 0) {
        setMyGames([]);
        return;
      }

      console.log(`Loading ${myGameIds.length} of my games...`);

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

      if (abortControllerMyGames.current.signal.aborted) return;

      const validMyGames = myGamesData.filter(g => g !== null);
      console.log(`Loaded ${validMyGames.length} of my games`);
      setMyGames(validMyGames);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('loadMyGames was aborted');
        return;
      }
      console.error('Error loading my games:', error);
    } finally {
      abortControllerMyGames.current = null;
    }
  }, [contract, account, setMyGames]);

  return { loadGames, loadMyGames };
};