import React, { useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import { shortAddress, formatAmount, formatTimeLeft } from '../../utils/formatting';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function MyGames() {
  const { contract, account } = useWeb3();
  const { myGames } = useGameStore();
  const { loadMyGames } = useGames();

  useEffect(() => {
    if (account) {
      loadMyGames();
      const interval = setInterval(loadMyGames, 30000);
      return () => clearInterval(interval);
    }
  }, [account, loadMyGames]);

  useEffect(() => {
    if (!account || !myGames.length) return;

    const now = Math.floor(Date.now() / 1000);
    const hasExpired = myGames.some(game => {
      const isCreator = game.player1.toLowerCase() === account.toLowerCase();
      return isCreator && 
             now >= game.expirationTime && 
             game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
    });

    if (hasExpired) {
      toast('You have expired games to withdraw!', {
        duration: 8000,
      });
    }
  }, [myGames, account]);

  const handleCancel = async (gameId) => {
    if (!contract) return;

    const toastId = toast.loading('Cancelling game...');

    try {
      const tx = await contract.cancelGame(gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Game cancelled!', { id: toastId });
      loadMyGames();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(`${error.reason || 'Failed to cancel'}`, { id: toastId });
    }
  };

  const handleWithdraw = async (gameId) => {
    if (!contract) return;

    const toastId = toast.loading('Withdrawing funds...');

    try {
      const tx = await contract.withdrawExpired(gameId);
      toast.loading('Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('Funds withdrawn!', { id: toastId });
      loadMyGames();
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(`${error.reason || 'Failed to withdraw'}`, { id: toastId });
    }
  };

  if (!account) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-xl font-bold text-primary mb-4">My Games</h3>
        <p className="text-gray-500 text-sm">Connect wallet to view your games</p>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  
  const expiredGames = myGames.filter(game => {
    const isCreator = game.player1.toLowerCase() === account.toLowerCase();
    return isCreator && 
           now >= game.expirationTime && 
           game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  });

  const activeGames = myGames.filter(game => {
    return now < game.expirationTime && 
           game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  });

  const playingGames = myGames.filter(game => 
    game.player2.toLowerCase() !== ZERO_ADDRESS.toLowerCase()
  );

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-xl font-bold text-primary mb-4">
        My Games ({myGames.length})
      </h3>

      {myGames.length === 0 ? (
        <p className="text-gray-500 text-sm">No active games</p>
      ) : (
        <div className="space-y-4">
          {expiredGames.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-orange-500 uppercase">Expired - Withdraw Now</span>
              </div>
              <div className="space-y-3">
                {expiredGames.map((game) => (
                  <div key={game.gameId} className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {formatAmount(game.betAmount)} MON
                        </p>
                        <p className="text-xs text-gray-500">
                          {game.player1Choice ? 'Heads' : 'Tails'}
                        </p>
                      </div>
                      <span className="text-xs text-orange-600 font-bold">
                        EXPIRED
                      </span>
                    </div>

                    <button
                      onClick={() => handleWithdraw(game.gameId)}
                      className="w-full bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition animate-pulse"
                    >
                      Withdraw {formatAmount(game.betAmount)} MON
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeGames.length > 0 && (
            <div>
              {expiredGames.length > 0 && (
                <div className="text-xs font-bold text-gray-500 uppercase mb-3 mt-4">
                  Active Games
                </div>
              )}
              <div className="space-y-3">
                {activeGames.map((game) => {
                  const isExpiringSoon = game.expirationTime - now < 3600;

                  return (
                    <div key={game.gameId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {formatAmount(game.betAmount)} MON
                          </p>
                          <p className="text-xs text-gray-500">
                            {game.player1Choice ? 'Heads' : 'Tails'}
                          </p>
                        </div>
                        <span className={`text-xs ${isExpiringSoon ? 'text-orange-500' : 'text-gray-400'}`}>
                          {isExpiringSoon && 'WARNING '}
                          {formatTimeLeft(game.expirationTime)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCancel(game.gameId)}
                        className="w-full bg-primary-dark text-white py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
                      >
                        Cancel Game
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {playingGames.length > 0 && (
            <div>
              {(expiredGames.length > 0 || activeGames.length > 0) && (
                <div className="text-xs font-bold text-gray-500 uppercase mb-3 mt-4">
                  In Progress
                </div>
              )}
              <div className="space-y-3">
                {playingGames.map((game) => (
                  <div key={game.gameId} className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {formatAmount(game.betAmount)} MON
                        </p>
                        <p className="text-xs text-gray-500">
                          {game.player1Choice ? 'Heads' : 'Tails'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-accent font-semibold mt-2">
                      Playing vs {shortAddress(game.player2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}