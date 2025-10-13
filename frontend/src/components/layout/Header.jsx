import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { shortAddress } from '../../utils/formatting';
import { MONAD_CHAIN_ID, MONAD_FAUCET } from '../../utils/constants';

export default function Header() {
  const { account, chainId, connectWallet, switchNetwork } = useWeb3();
  const { setShowCreateModal } = useGameStore();

  const isCorrectNetwork = chainId === MONAD_CHAIN_ID;

  return (
    <header className="glass-strong border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-2xl">🎲</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                MonadFlip
              </h1>
              <p className="text-xs text-gray-400">Double or Nothing</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass px-6 py-3 rounded-xl font-bold text-white hover:glass-strong transition-all glow-primary"
            >
              Create Game
            </button>

            {MONAD_FAUCET && (
              <a
                href={MONAD_FAUCET}
                target="_blank"
                rel="noopener noreferrer"
                className="glass px-4 py-3 rounded-xl text-sm font-semibold text-accent hover:glass-strong transition-all"
              >
                Get MON
              </a>
            )}

            {account && !isCorrectNetwork && (
              <button
                onClick={switchNetwork}
                className="glass px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:glass-strong transition-all"
              >
                Switch Network
              </button>
            )}

            <button
              onClick={connectWallet}
              className="glass-strong px-6 py-3 rounded-xl font-bold text-white hover:glow-accent transition-all"
            >
              {account ? shortAddress(account) : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}