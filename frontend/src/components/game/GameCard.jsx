import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import { shortAddress, formatTimeLeft, formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function GameCard({ game, isMyGame = false }) {
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

  const handleCancel = async () => {
    if (!contract) return;

    const toastId = toast.loading('Cancelling game...');

    try {
      const tx = await contract.cancelGame(game.gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Game cancelled!', { id: toastId });
      loadMyGames();
      loadGames();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(`${error.reason || 'Failed to cancel'}`, { id: toastId });
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;

    const toastId = toast.loading('Withdrawing funds...');

    try {
      const tx = await contract.withdrawExpired(game.gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Funds withdrawn!', { id: toastId });
      loadMyGames();
      loadGames();
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(`${error.reason || 'Failed to withdraw'}`, { id: toastId });
    }
  };

  const timeLeft = formatTimeLeft(game.expirationTime);
  const isExpiringSoon = game.expirationTime - Math.floor(Date.now() / 1000) < 3600;
  const isExpired = game.expirationTime - Math.floor(Date.now() / 1000) <= 0;
  const isCreator = account && game.player1.toLowerCase() === account.toLowerCase();
  const isWaiting = game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();

  if (isMyGame) {
    if (isExpired && isWaiting) {
      return (
        <div className="rounded-3xl p-6 flex items-center justify-between text-white bg-orange-500">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
            </div>
            <p className="text-sm text-white/90 mt-1">
              {game.player1Choice ? 'Heads' : 'Tails'} | {formatAmount(game.betAmount)} MON
            </p>
            <p className="text-xs mt-2 text-white/80 font-bold">
              EXPIRED - WITHDRAW NOW
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            className="bg-white text-orange-600 px-8 py-4 rounded-full text-xl font-bold hover:bg-opacity-90 transition whitespace-nowrap shadow-lg"
          >
            Withdraw
          </button>
        </div>
      );
    }

    if (isWaiting) {
      return (
        <div className="rounded-3xl p-6 flex items-center justify-between text-white bg-primary">
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
            onClick={handleCancel}
            className="bg-primary-dark px-8 py-4 rounded-full text-xl font-bold hover:bg-opacity-90 transition whitespace-nowrap shadow-lg"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-3xl p-6 flex items-center justify-between text-white bg-accent">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
          </div>
          <p className="text-sm text-white/90 mt-1">
            {game.player1Choice ? 'Heads' : 'Tails'} | {formatAmount(game.betAmount)} MON
          </p>
          <p className="text-xs mt-2 text-white/80">
            Playing vs {shortAddress(game.player2)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold">IN PROGRESS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 flex items-center justify-between text-white bg-primary">
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