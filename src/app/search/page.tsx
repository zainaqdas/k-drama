import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const metadata = {
  title: 'Search Dramas — WaveDrama',
  description: 'Search for Asian dramas, movies, and K-Shows on WaveDrama.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  );
}
