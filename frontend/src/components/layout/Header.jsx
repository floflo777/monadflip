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
    <header className="bg-primary h-[15vh] flex items-center justify-between px-8 relative z-10">
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-primary-dark text-white px-6 py-3 rounded-full text-xl font-bold hover:bg-opacity-90 transition"
      >
        Create Game
      </button>

      <div className="flex items-center gap-3 flex-1 justify-center">
        <img src="/heads.png" alt="Whale" className="w-12 h-12" />
        <h1 className="text-white text-4xl font-bold">
          MonadFlip
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {MONAD_FAUCET && (
          <a
            href={MONAD_FAUCET}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition"
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
          className="bg-primary-dark text-white px-6 py-3 rounded-full text-xl font-bold hover:bg-opacity-90 transition whitespace-nowrap"
        >
          {account ? shortAddress(account) : 'Connect'}
        </button>
      </div>
    </header>
  );
}