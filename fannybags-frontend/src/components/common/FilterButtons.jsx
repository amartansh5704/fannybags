import React from 'react';

export default function FilterButtons({ filters, onFilterChange }) {
  const genres = ['All', 'Hip-Hop', 'Pop', 'Electronic', 'Rock', 'Jazz', 'Classical'];
  const priceRanges = [
    { label: 'All', value: 'all' },
    { label: '₹1K-10K', value: '1k-10k' },
    { label: '₹10K-50K', value: '10k-50k' },
    { label: '₹50K+', value: '50k+' }
  ];

  return (
    <div className="space-y-4">
      {/* Genre Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Genre</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onFilterChange('genre', genre === 'All' ? '' : genre)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filters.genre === (genre === 'All' ? '' : genre)
                  ? 'bg-fb-pink text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Investment Range</h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onFilterChange('priceRange', range.value)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filters.priceRange === range.value
                  ? 'bg-fb-green text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}