import { getGenreList } from '@/lib/server-data';
import GenreGrid from '@/components/GenreGrid';
import Link from 'next/link';
import { Tags } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Genres — WaveDrama',
  description: 'Browse Asian dramas by genre. Find action, romance, comedy, thriller, fantasy, and more.',
};

export default async function GenresPage() {
  let genres: { name: string; slug: string; url: string }[] = [];
  let error = false;

  try {
    genres = await getGenreList();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <Tags className="w-3.5 h-3.5" />
          Genres
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Browse by Genre
        </h1>
        <p className="text-gray-400 text-sm">
          Find your next favorite drama by exploring genres
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Could not load genres. Make sure the API server is running.</p>
          <Link href="/" className="btn-primary inline-block mt-4">
            Go Home
          </Link>
        </div>
      ) : (
        <GenreGrid genres={genres} />
      )}
    </div>
  );
}
