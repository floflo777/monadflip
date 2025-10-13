import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import { shortAddress, formatTimeLeft, formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function GameCard({ game, featured = false }) {
  const { contract, account } = useWeb3();
  const { setShowAnimation, setFlipResult, setResultMessage } = useGameStore();
  const { loadGames, loadMyGames } = useGames();

  const handleJoin = async () => {
    if (!account) {
      toast.error('Please connect your wallet first', {
        duration: 4000,
        style: {
          background: '#14044d',
          color: '#fff',
        },
      });
      return;
    }

    if (!contract) {
      toast.error('Please connect your wallet');
      return;
    }

    const toastId = toast.loading('Waiting for wallet confirmation...', {
      style: {
        background: '#14044d',
        color: '#fff',
      },
    });

    try {
      const tx = await contract.joinGame(game.gameId, {
        value: ethers.parseEther(game.betAmount)
      });

      toast.loading('Transaction pending...', { id: toastId });

      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        throw new Error('Transaction failed');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedGame = await contract.getGame(game.gameId);
      const winner = updatedGame.winner;
      const p1Choice = updatedGame.player1Choice;

      let result = 'heads';
      if (
        (winner.toLowerCase() === updatedGame.player1.toLowerCase() && !p1Choice) ||
        (winner.toLowerCase() !== updatedGame.player1.toLowerCase() && p1Choice)
      ) {
        result = 'tails';
      }

      setFlipResult(result + '-' + Date.now());

      const betNum = parseFloat(game.betAmount);
      let message = '';
      if (account.toLowerCase() === winner.toLowerCase()) {
        const winAmount = (betNum * 1.999).toFixed(4);
        message = `You won ${winAmount} MON!`;
        toast.success(message, { 
          id: toastId,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%)',
            color: '#fff',
          },
        });
      } else {
        message = `You lost ${game.betAmount} MON`;
        toast.error(`${message}\nBetter luck next time!`, { 
          id: toastId,
          duration: 6000,
          style: {
            background: '#14044d',
            color: '#fff',
          },
        });
      }

      setResultMessage(message);
      setShowAnimation(true);

      setTimeout(() => {
        setShowAnimation(false);
        setFlipResult(null);
        setResultMessage('');
        loadGames();
        loadMyGames();
      }, 7000);
    } catch (error) {
      console.error('Join game error:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Transaction rejected', { id: toastId });
      } else if (error.code === 'UNKNOWN_ERROR' || error.code === -32005) {
        toast.error('Transaction reverted - Please try again', { id: toastId });
      } else if (error.message && error.message.includes('Game already joined')) {
        toast.error('This game has already been joined', { id: toastId });
      } else if (error.message && error.message.includes('rate limit')) {
        toast.error('Network busy - Please try again in a moment', { id: toastId });
      } else {
        toast.error('Transaction failed - Please try again', { id: toastId });
      }
    }
  };

  const timeLeft = formatTimeLeft(game.expirationTime);
  const isExpiringSoon = game.expirationTime - Math.floor(Date.now() / 1000) < 3600;

  return (
    <div className={`rounded-3xl p-6 flex items-center justify-between text-white ${
      featured 
        ? 'bg-gradient-to-r from-primary to-primary-dark shadow-lg border-2 border-accent/30' 
        : 'bg-primary'
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          {game.player1Choice ? 'Heads' : 'Tails'} | {formatAmount(game.betAmount)} MON
        </p>
        <p className={`text-xs mt-2 ${isExpiringSoon ? 'text-orange-300' : 'text-gray-400'}`}>
          {isExpiringSoon && 'Expires in ' + timeLeft}
        </p>
      </div>

      <button
        onClick={handleJoin}
        className="bg-primary-dark px-8 py-4 rounded-full text-xl font-bold hover:bg-opacity-90 transition whitespace-nowrap shadow-lg"
      >
        Join Game
      </button>
    </div>
  );
}