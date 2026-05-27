'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import DramaCard from '@/components/DramaCard';
import { searchDrama } from '@/lib/api';
import type { MediaItem } from '@/lib/api';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function performSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchDrama(q);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <Search className="w-3.5 h-3.5" />
          Search
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Find Your Next Drama
        </h1>
        <p className="text-gray-400 text-sm">
          Search thousands of Asian dramas, movies, and shows
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          large
        />
      </div>

      {/* Results */}
      <div className="min-h-[40vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-400">Searching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Search className="w-12 h-12 text-gray-600" />
            <p className="text-base text-gray-400">
              No results found for &ldquo;{initialQuery}&rdquo;
            </p>
            <p className="text-sm text-gray-500">Try different keywords</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{initialQuery}&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {results.map((item, i) => (
                <DramaCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        ) : null}

        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Search className="w-16 h-16 text-gray-700" />
            <p className="text-gray-500 text-sm">Enter a keyword to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
