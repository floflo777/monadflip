import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { ethers } from 'ethers';
import { MIN_BET, DURATION_OPTIONS } from '../../utils/constants';
import { getReferral } from '../../utils/referral';
import toast from 'react-hot-toast';

export default function CreateGameModal() {
  const { contract, account } = useWeb3();
  const { setShowCreateModal } = useGameStore();
  const [betAmount, setBetAmount] = useState('');
  const [choice, setChoice] = useState(true);
  const [duration, setDuration] = useState(86400);

  const handleCreate = async () => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!betAmount || parseFloat(betAmount) < parseFloat(MIN_BET)) {
      toast.error(`Minimum bet is ${MIN_BET} MON`);
      return;
    }

    const toastId = toast.loading('Creating game...');

    try {
      const weiAmount = ethers.parseEther(betAmount);
      const referrerAddress = getReferral() || ethers.ZeroAddress;

      const tx = await contract.createGame(
        weiAmount,
        choice,
        duration,
        referrerAddress,
        { value: weiAmount }
      );

      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();

      toast.success('Game created! Click Refresh to see it in the list.', { 
        id: toastId,
        duration: 5000
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create game error:', error);
      toast.error(`${error.reason || 'Failed to create game'}`, { id: toastId });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm"
      onClick={() => setShowCreateModal(false)}
    >
      <div
        className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-primary mb-6">Create a Game</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Bet Amount (MON)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder={`Min ${MIN_BET} MON`}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Your Choice
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setChoice(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  choice
                    ? 'bg-primary text-white'
                    : 'glass text-primary hover:glass-card'
                }`}
              >
                Heads
              </button>
              <button
                onClick={() => setChoice(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  !choice
                    ? 'bg-primary text-white'
                    : 'glass text-primary hover:glass-card'
                }`}
              >
                Tails
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Expiration Time
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/50"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleCreate}
            className="flex-1 bg-gradient-to-r from-accent to-primary text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Create
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 glass text-gray-700 py-3 rounded-lg font-bold hover:glass-card transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}