import React from 'react';

export default function SortDropdown({ value, onChange }) {
  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Most Funded', value: 'most_funded' },
    { label: 'Ending Soon', value: 'ending_soon' },
    { label: 'Lowest Price', value: 'lowest_price' },
    { label: 'Highest Price', value: 'highest_price' }
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-fb-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-fb-pink appearance-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        ▼
      </div>
    </div>
  );
}