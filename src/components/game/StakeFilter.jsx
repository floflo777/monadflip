import React from 'react';
import { STAKE_CATEGORIES } from '../../utils/constants';

export default function StakeFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {STAKE_CATEGORIES.map((category) => (
        <button
          key={category.label}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedCategory.label === category.label
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-primary hover:bg-gray-200'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}