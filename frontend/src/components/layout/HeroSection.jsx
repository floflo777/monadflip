import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

export default function HeroSection() {
  const { setShowCreateModal } = useGameStore();

  return (
    <div className="text-center py-12 mb-8">
      <h1 className="text-5xl font-bold text-primary-dark mb-3">
        MonadFlip
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Provably fair coin flips on Monad
      </p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
      >
        Create a Game
      </button>
    </div>
  );
}