import React from 'react';

export default function GameFilters({ filters, setFilters }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-primary">Min:</label>
        <input
          type="number"
          step="0.001"
          placeholder="0.001"
          value={filters.minBet}
          onChange={(e) => setFilters({ ...filters, minBet: e.target.value })}
          className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-primary">Max:</label>
        <input
          type="number"
          step="0.001"
          placeholder="100"
          value={filters.maxBet}
          onChange={(e) => setFilters({ ...filters, maxBet: e.target.value })}
          className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="text-sm font-semibold text-primary">Sort:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-4 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="recent">Most Recent</option>
          <option value="amount-asc">Lowest Bet</option>
          <option value="amount-desc">Highest Bet</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>
    </div>
  );
}