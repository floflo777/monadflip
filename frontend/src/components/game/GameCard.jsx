import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import { shortAddress, formatTimeLeft, formatAmount } from '../../utils/formatting';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Helper functions for amount color coding
const getAmountClass = (amount) => {
  const num = parseFloat(amount);
  if (num < 0.01) return 'amount-micro';
  if (num < 0.1) return 'amount-low';
  if (num < 1) return 'amount-medium';
  if (num < 10) return 'amount-high';
  return 'amount-whale';
};

const getAmountGlow = (amount) => {
  const num = parseFloat(amount);
  if (num >= 10) return 'pulse-high-stakes';
  if (num >= 1) return 'glow-accent';
  return '';
};

const getAmountBadge = (amount) => {
  const num = parseFloat(amount);
  if (num >= 10) return { text: 'WHALE', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
  if (num >= 1) return { text: 'HIGH', color: 'bg-red-500/20 text-red-300 border-red-500/50' };
  if (num >= 0.1) return { text: 'MED', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' };
  return null;
};

export default function GameCard({ game, isMyGame = false, section = null }) {
  const { contract, account } = useWeb3();
  const { setShowAnimation, setFlipResult, setResultMessage } = useGameStore();
  const { loadGames, loadMyGames } = useGames();

  const handleJoin = async () => {
    if (!account) {
      toast.error('Please connect your wallet first', {
        duration: 4000,
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#fff',
          border: '1px solid rgba(99, 102, 241, 0.3)',
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
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(99, 102, 241, 0.3)',
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
        const winAmount = (betNum * 1.985).toFixed(4);
        message = `You won ${winAmount} MON!`;
        toast.success(message, { 
          id: toastId,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(34, 211, 238, 0.5)',
          },
        });
      } else {
        message = `You lost ${game.betAmount} MON`;
        toast.error(`${message}\nBetter luck next time!`, { 
          id: toastId,
          duration: 6000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(248, 113, 113, 0.5)',
          },
        });
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

    const toastId = toast.loading('Cancelling game...', {
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      },
    });

    try {
      const tx = await contract.cancelGame(game.gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Game cancelled! Click Refresh to update the list.', { 
        id: toastId,
        duration: 5000
      });
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(`${error.reason || 'Failed to cancel'}`, { id: toastId });
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;

    const toastId = toast.loading('Withdrawing funds...', {
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      },
    });

    try {
      const tx = await contract.withdrawExpired(game.gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Funds withdrawn! Click Refresh to update the list.', { 
        id: toastId,
        duration: 5000
      });
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(`${error.reason || 'Failed to withdraw'}`, { id: toastId });
    }
  };

  const timeLeft = formatTimeLeft(game.expirationTime);
  const isExpiringSoon = game.expirationTime - Math.floor(Date.now() / 1000) < 3600;
  const badge = getAmountBadge(game.betAmount);

  // Rendu pour My Games avec sections
  if (isMyGame) {
    if (section === 'expired') {
      return (
        <div className={`glass-card rounded-2xl p-6 flex items-center justify-between text-white border-2 border-orange-500/50 transition-all ${getAmountGlow(game.betAmount)}`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/50">
                EXPIRED
              </span>
              {badge && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                  {badge.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            className="glass-strong px-8 py-4 rounded-xl text-lg font-bold hover:glow-accent transition-all transform hover:scale-105"
          >
            Withdraw
          </button>
        </div>
      );
    }

    if (section === 'active') {
      return (
        <div className={`glass-card rounded-2xl p-6 flex items-center justify-between text-white transition-all ${getAmountGlow(game.betAmount)}`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-primary/20 px-3 py-1 rounded-full border border-primary/50">
                ACTIVE
              </span>
              {badge && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                  {badge.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
            </p>
            {isExpiringSoon && (
              <p className="text-xs mt-2 text-orange-400 font-semibold">
                Expires in {timeLeft}
              </p>
            )}
          </div>

          <button
            onClick={handleCancel}
            className="glass px-8 py-4 rounded-xl text-lg font-bold hover:glass-strong transition-all"
          >
            Cancel
          </button>
        </div>
      );
    }

    // Section playing
    return (
      <div className={`glass-card rounded-2xl p-6 flex items-center justify-between text-white border-2 border-accent/50 transition-all ${getAmountGlow(game.betAmount)}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-accent/20 px-3 py-1 rounded-full border border-accent/50">
              IN PROGRESS
            </span>
            {badge && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
          </p>
          <p className="text-xs mt-2 text-accent">
            vs {shortAddress(game.player2)}
          </p>
        </div>
      </div>
    );
  }

  // Rendu pour All Games
  return (
    <div className={`glass-card rounded-2xl p-6 flex items-center justify-between text-white hover:glass-strong transition-all group ${getAmountGlow(game.betAmount)}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {badge && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
              {badge.text}
            </span>
          )}
          {isExpiringSoon && (
            <span className="text-xs font-bold bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/50">
              EXPIRING SOON
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{shortAddress(game.player1)}</p>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          {game.player1Choice ? 'Heads' : 'Tails'} | <span className={getAmountClass(game.betAmount)}>{formatAmount(game.betAmount)} MON</span>
        </p>
        {isExpiringSoon && (
          <p className="text-xs mt-2 text-orange-400">
            {timeLeft} left
          </p>
        )}
      </div>

      <button
        onClick={handleJoin}
        className="glass-strong px-8 py-4 rounded-xl text-lg font-bold hover:glow-accent transition-all transform group-hover:scale-105"
      >
        Join Game
      </button>
    </div>
  );
}