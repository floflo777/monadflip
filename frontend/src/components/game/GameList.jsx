import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import GameCard from './GameCard';
import GameFilters from './GameFilters';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function GameList() {
  const { account } = useWeb3();
  const { games, myGames, loading } = useGameStore();
  const { loadGames, loadMyGames } = useGames();
  const [showMyGames, setShowMyGames] = useState(false);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filters, setFilters] = useState({
    minBet: '',
    maxBet: '',
    sortBy: 'recent'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  const handleRefresh = async () => {
    if (showMyGames) {
      await loadMyGames();
    } else {
      await loadGames();
    }
  };

  useEffect(() => {
    if (showMyGames && account) {
      loadMyGames();
    } else {
      loadGames();
    }
  }, [showMyGames, account]);

  useEffect(() => {
    let result = showMyGames ? [...myGames] : [...games];

    if (!showMyGames && account) {
      result = result.filter(g => g.player1.toLowerCase() !== account.toLowerCase());
    }

    if (filters.minBet) {
      result = result.filter(g => parseFloat(g.betAmount) >= parseFloat(filters.minBet));
    }

    if (filters.maxBet) {
      result = result.filter(g => parseFloat(g.betAmount) <= parseFloat(filters.maxBet));
    }

    if (filters.sortBy === 'recent') {
      result.sort((a, b) => b.createTime - a.createTime);
    } else if (filters.sortBy === 'amount-asc') {
      result.sort((a, b) => parseFloat(a.betAmount) - parseFloat(b.betAmount));
    } else if (filters.sortBy === 'amount-desc') {
      result.sort((a, b) => parseFloat(b.betAmount) - parseFloat(a.betAmount));
    } else if (filters.sortBy === 'expiring') {
      result.sort((a, b) => a.expirationTime - b.expirationTime);
    }

    setFilteredGames(result);
    setCurrentPage(1);
  }, [games, myGames, filters, showMyGames, account]);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const now = Math.floor(Date.now() / 1000);
  
  const expiredGames = showMyGames ? filteredGames.filter(game => {
    const isCreator = game.player1.toLowerCase() === account?.toLowerCase();
    return isCreator && 
           now >= game.expirationTime && 
           game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  }) : [];

  const activeMyGames = showMyGames ? filteredGames.filter(game => {
    return now < game.expirationTime && 
           game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  }) : [];

  const playingGames = showMyGames ? filteredGames.filter(game => 
    game.player2.toLowerCase() !== ZERO_ADDRESS.toLowerCase()
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowMyGames(false)}
            className={`glass-card px-6 py-3 rounded-lg font-bold text-lg transition ${
              !showMyGames
                ? 'bg-primary/20 text-primary'
                : 'text-primary hover:glass-strong'
            }`}
          >
            All Games
          </button>
          
          {account && (
            <button
              onClick={() => setShowMyGames(true)}
              className={`glass-card px-6 py-3 rounded-lg font-bold text-lg transition ${
                showMyGames
                  ? 'bg-primary/20 text-primary'
                  : 'text-primary hover:glass-strong'
              }`}
            >
              My Games
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="ml-auto glass-card p-3 rounded-lg hover:glass-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <svg 
              className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {showMyGames && expiredGames.length > 0 && (
          <div className="mb-6 p-4 glass-card rounded-lg border-2 border-orange-300">
            <p className="text-orange-700 font-bold">
              You have {expiredGames.length} expired {expiredGames.length === 1 ? 'game' : 'games'} to withdraw!
            </p>
          </div>
        )}

        <GameFilters filters={filters} setFilters={setFilters} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading games...</p>
        </div>
      ) : currentGames.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center">
          <p className="text-gray-500 text-lg">
            {showMyGames ? 'You have no games yet' : 'No games in this category'}
          </p>
          <p className="text-gray-400 mt-2">
            {showMyGames ? 'Create or join a game to get started!' : 'Try a different filter or create one!'}
          </p>
        </div>
      ) : (
        <>
          {showMyGames ? (
            <div className="space-y-6">
              {currentGames.map((game) => {
                const isExpired = now >= game.expirationTime;
                const isWaiting = game.player2.toLowerCase() === ZERO_ADDRESS.toLowerCase();
                const isCreator = game.player1.toLowerCase() === account?.toLowerCase();
                
                let section = 'playing';
                if (isExpired && isWaiting && isCreator) {
                  section = 'expired';
                } else if (isWaiting) {
                  section = 'active';
                }
                
                return (
                  <GameCard 
                    key={game.gameId} 
                    game={game} 
                    isMyGame={true}
                    section={section}
                  />
                );
              })}
              
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="glass-card px-4 py-2 rounded-lg text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:glass-strong transition"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`glass-card px-4 py-2 rounded-lg font-semibold transition ${
                          currentPage === pageNum
                            ? 'bg-primary/20 text-primary'
                            : 'text-primary hover:glass-strong'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="glass-card px-4 py-2 rounded-lg text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:glass-strong transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentGames.map((game) => (
                  <GameCard key={game.gameId} game={game} isMyGame={false} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="glass-card px-4 py-2 rounded-lg text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:glass-strong transition"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`glass-card px-4 py-2 rounded-lg font-semibold transition ${
                          currentPage === pageNum
                            ? 'bg-primary/20 text-primary'
                            : 'text-primary hover:glass-strong'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="glass-card px-4 py-2 rounded-lg text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:glass-strong transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}