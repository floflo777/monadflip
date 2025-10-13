import React from 'react';
import { CONTRACT_ADDRESS, MONAD_EXPLORER } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-primary-dark mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Logo/Name */}
          <div className="text-white">
            <h3 className="text-xl font-bold">MonadFlip</h3>
            <p className="text-sm text-gray-400 mt-1">Fair, Fast, On-Chain</p>
          </div>

          {/* Center - Social Links */}
          <div className="flex items-center gap-6">
            <a
              href={`https://monad-testnet.socialscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-accent transition group"
              title="View Contract"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-8h8v2H8v-2zm0 4h8v2H8v-2zm0-8h5v2H8V8z"/>
              </svg>
              <span className="text-sm hidden md:inline">Contract</span>
            </a>

            <a
              href="https://x.com/Florent574421"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-accent transition group"
              title="Follow on X"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm hidden md:inline">Twitter</span>
            </a>

            <a
              href="https://github.com/floflo777/monadflip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-accent transition group"
              title="View on GitHub"
            >
              <svg 
                className="w-6 h-6 group-hover:scale-110 transition" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm hidden md:inline">GitHub</span>
            </a>
          </div>

          {/* Right - Copyright */}
          <div className="text-white text-sm text-center md:text-right">
            <p className="text-gray-400">Built on Monad</p>
            <p className="text-xs text-gray-500 mt-1">© 2025 MonadFlip</p>
          </div>
        </div>

        {/* Bottom - Contract Address */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500"> 
            Contract: 
            <a
              href={`https://monad-testnet.socialscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-accent hover:text-white transition font-mono"
            >
              {CONTRACT_ADDRESS}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}