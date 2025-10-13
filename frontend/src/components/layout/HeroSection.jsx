import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

export default function HeroSection() {
  const { setShowCreateModal } = useGameStore();

  return (
    <div className="relative overflow-hidden py-20">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-6xl md:text-7xl font-black mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
            FLIP TO WIN
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-300 mb-4">
          Double your MON or lose it all
        </p>
        
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          The fairest coin flip on Monad. Provably random, instant results, low fees.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-strong px-8 py-4 rounded-xl text-xl font-bold text-white hover:glow-accent transition-all transform hover:scale-105"
          >
            Start Flipping
          </button>
          
          <a
            href="#how-it-works"
            className="glass px-8 py-4 rounded-xl text-xl font-semibold text-gray-300 hover:text-white hover:glass-strong transition-all"
          >
            How it works?
          </a>
        </div>

        {/* Stats display */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-xl">
            <div className="text-3xl font-bold text-accent mb-1">1.985x</div>
            <div className="text-sm text-gray-400">Payout Multiplier</div>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">1%</div>
            <div className="text-sm text-gray-400">House Edge</div>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="text-3xl font-bold text-accent mb-1">Instant</div>
            <div className="text-sm text-gray-400">Settlement</div>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-gray-400">On-Chain</div>
          </div>
        </div>
      </div>
    </div>
  );
}