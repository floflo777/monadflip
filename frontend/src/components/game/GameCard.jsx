import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { shortAddress, formatTimeLeft, formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const getAmountClass = (amount) => {
  const num = parseFloat(amount);
  if (num < 0.01) return 'amount-micro';
  if (num < 0.1) return 'amount-low';
  if (num < 1) return 'amount-medium';
  if (num < 10) return 'amount-high';
  return 'amount-whale';
};

const shouldPulse = (amount) => {
  return parseFloat(amount) >= 5;
};

export default function GameCard({ game, isMyGame = false, section = null }) {
  const { contract, account } = useWeb3();
  const { setShowAnimation, setFlipResult, setResultMessage } = useGameStore();

  const handleJoin = async () => {
    if (!account) {
      toast.error('Please connect your wallet first', { duration: 4000 });
      return;
    }

    if (!contract) {
      toast.error('Please connect your wallet');
      return;
    }

    const toastId = toast.loading('Waiting for wallet confirmation...');

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
        const winAmount = (betNum * 1.985).toFixed(4);
        message = `You won ${winAmount} MON!`;
        toast.success(message, { id: toastId, duration: 8000 });
      } else {
        message = `You lost ${game.betAmount} MON`;
        toast.error(`${message}\nBetter luck next time!`, { id: toastId, duration: 6000 });
      }

      setResultMessage(message);
      setShowAnimation(true);

      setTimeout(() => {
        setShowAnimation(false);
        setFlipResult(null);
        setResultMessage('');
      }, 7000);
    } catch (error) {
      console.error('Join game error:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('Transaction rejected', { id: toastId });
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
      toast.success('Game cancelled! Click Refresh to update.', { id: toastId, duration: 5000 });
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
      toast.success('Funds withdrawn! Click Refresh to update.', { id: toastId, duration: 5000 });
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(`${error.reason || 'Failed to withdraw'}`, { id: toastId });
    }
  };

  const timeLeft = formatTimeLeft(game.expirationTime);
  const isExpiringSoon = game.expirationTime - Math.floor(Date.now() / 1000) < 3600;
  const pulseClass = shouldPulse(game.betAmount) ? 'pulse-high' : '';

  if (isMyGame) {
    if (section === 'expired') {
      return (
        <div className={`glass-card rounded-3xl p-6 flex items-center justify-between border-2 border-orange-400 ${pulseClass}`}>
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-600 mb-2">EXPIRED</p>
            <p className="text-lg font-semibold text-primary">{shortAddress(game.player1)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
            </p>
          </div>
          <button
            onClick={handleWithdraw}
            className="bg-gradient-to-r from-accent to-primary text-white px-8 py-4 rounded-full text-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Withdraw
          </button>
        </div>
      );
    }

    if (section === 'active') {
      return (
        <div className={`glass-card rounded-3xl p-6 flex items-center justify-between ${pulseClass}`}>
          <div className="flex-1">
            <p className="text-xs font-bold text-primary mb-2">ACTIVE</p>
            <p className="text-lg font-semibold text-primary">{shortAddress(game.player1)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
            </p>
            {isExpiringSoon && (
              <p className="text-xs mt-2 text-orange-600 font-semibold">Expires in {timeLeft}</p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="bg-primary-dark text-white px-8 py-4 rounded-full text-xl font-bold hover:shadow-lg transition-all"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className={`glass-card rounded-3xl p-6 flex items-center justify-between border-2 border-accent ${pulseClass}`}>
        <div className="flex-1">
          <p className="text-xs font-bold text-accent mb-2">IN PROGRESS</p>
          <p className="text-lg font-semibold text-primary">{shortAddress(game.player1)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
          </p>
          <p className="text-xs mt-2 text-accent">vs {shortAddress(game.player2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-3xl p-6 flex items-center justify-between ${pulseClass}`}>
      <div className="flex-1">
        <p className="text-lg font-semibold text-primary">{shortAddress(game.player1)}</p>
        <p className="text-sm text-gray-600 mt-1">
          {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
        </p>
        {isExpiringSoon && (
          <p className="text-xs mt-2 text-orange-600">{timeLeft} left</p>
        )}
      </div>
      <button
        onClick={handleJoin}
        className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-full text-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
      >
        Join Game
      </button>
    </div>
  );
}