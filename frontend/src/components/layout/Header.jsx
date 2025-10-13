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
    <header className="glass border-b border-white/20 h-[15vh] flex items-center justify-between px-8 relative z-10">
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-primary-dark text-white px-6 py-3 rounded-full text-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
      >
        Create Game
      </button>

      <div className="flex items-center gap-3 flex-1 justify-center">
        <img src="/favicon-32x32.png" alt="MonadFlip" className="w-10 h-10" />
        <h1 className="text-primary-dark text-4xl font-bold">
          MonadFlip
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {MONAD_FAUCET && (
          <a
            href={MONAD_FAUCET}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all"
          >
            Get MON
          </a>
        )}

        {account && !isCorrectNetwork && (
          <button
            onClick={switchNetwork}
            className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition"
          >
            Switch Network
          </button>
        )}

        <button
          onClick={connectWallet}
          className="bg-primary-dark text-white px-6 py-3 rounded-full text-xl font-bold hover:shadow-lg transition-all whitespace-nowrap"
        >
          {account ? shortAddress(account) : 'Connect'}
        </button>
      </div>
    </header>
  );
}