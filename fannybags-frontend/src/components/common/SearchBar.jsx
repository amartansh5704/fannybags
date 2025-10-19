import React from 'react';

export default function SearchBar({ value, onChange, placeholder = "Search campaigns..." }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-10 bg-fb-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-fb-pink"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        🔍
      </div>
    </div>
  );
}