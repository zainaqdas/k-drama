'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  large?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search dramas, movies, shows...',
  large = false,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${
            large ? 'w-6 h-6' : 'w-5 h-5'
          }`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface border border-surface-lighter rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
            large
              ? 'pl-14 pr-6 py-4 text-lg'
              : 'pl-11 pr-4 py-3 text-sm'
          }`}
        />
        {value && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        )}
      </div>
    </form>
  );
}
