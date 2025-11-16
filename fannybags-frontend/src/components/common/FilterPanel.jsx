import React, { useState } from 'react';

export default function FilterPanel({ onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    priceRange: 'all',
    sort: 'newest'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      genre: '',
      priceRange: 'all',
      sort: 'newest'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-fb-surface p-6 rounded-lg mb-8">

      {/* TOP BAR: Only "Show Filters" button on the right */}
      <div className="flex justify-end items-center gap-4 mb-6">

        <button
          onClick={toggleFilters}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            backgroundColor: "#FF48B9",
            whiteSpace: "nowrap",
            fontSize: "14px"
          }}
        >
          {isOpen ? "Hide Filters" : "Show Filters"}
        </button>

      </div>

      {/* FILTER SECTION */}
      {isOpen && (
        <div className="space-y-6">

          {/* GENRE */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Hip-Hop', 'Pop', 'Electronic', 'Rock', 'Jazz', 'Classical'].map((genre) => (
                <button
                  key={genre}
                  onClick={() =>
                    handleFilterChange('genre', genre === 'All' ? '' : genre)
                  }
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

          {/* PRICE RANGE */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Investment Range</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: 'all' },
                { label: '₹1K-10K', value: '1k-10k' },
                { label: '₹10K-50K', value: '10k-50k' },
                { label: '₹50K+', value: '50k+' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleFilterChange('priceRange', range.value)}
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

          {/* SORT */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-4 py-3 bg-fb-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-fb-pink"
            >
              <option value="newest">Newest First</option>
              <option value="most_funded">Most Funded</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_price">Highest Price</option>
            </select>
          </div>

          {/* CLEAR BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Clear All Filters
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
