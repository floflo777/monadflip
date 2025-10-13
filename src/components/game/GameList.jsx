import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { useGames } from '../../hooks/useGames';
import GameCard from './GameCard';
import GameFilters from './GameFilters';
import StakeFilter from './StakeFilter';
import { STAKE_CATEGORIES } from '../../utils/constants';

export default function GameList() {
  const { games, loading } = useGameStore();
  const { loadGames } = useGames();
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(STAKE_CATEGORIES[0]);
  const [filters, setFilters] = useState({
    minBet: '',
    maxBet: '',
    sortBy: 'recent'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    let result = [...games];

    // Filtre par catégorie
    if (selectedCategory.label !== 'All') {
      result = result.filter(g => {
        const amount = parseFloat(g.betAmount);
        return amount >= selectedCategory.min && amount < selectedCategory.max;
      });
    }

    // Filtres personnalisés
    if (filters.minBet) {
      result = result.filter(g => parseFloat(g.betAmount) >= parseFloat(filters.minBet));
    }

    if (filters.maxBet) {
      result = result.filter(g => parseFloat(g.betAmount) <= parseFloat(filters.maxBet));
    }

    // Tri
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
  }, [games, filters, selectedCategory]);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  // Featured games (top 5)
  const featuredGames = filteredGames.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Featured Games */}
      {featuredGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4"> Featured Games</h2>
          <div className="space-y-3">
            {featuredGames.map((game) => (
              <GameCard key={game.gameId} game={game} featured />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4"> All Games</h2>
        
        <StakeFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <GameFilters filters={filters} setFilters={setFilters} />

        <div className="flex items-center justify-between mb-4">
          <span className="text-primary-dark font-semibold">
            {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </span>
        </div>
      </div>

      {/* Game List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading games...</p>
        </div>
      ) : currentGames.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center">
          <p className="text-gray-500 text-lg">No games in this category</p>
          <p className="text-gray-400 mt-2">Try a different filter or create one!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {currentGames.map((game) => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-primary hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}