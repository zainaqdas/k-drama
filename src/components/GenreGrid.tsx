import Link from 'next/link';

interface GenreGridProps {
  genres: { name: string; slug: string; url: string }[];
}

const genreColors: Record<string, string> = {
  action: 'from-red-600/20 to-red-900/20 border-red-500/20 hover:border-red-500/40',
  romance: 'from-pink-600/20 to-pink-900/20 border-pink-500/20 hover:border-pink-500/40',
  comedy: 'from-yellow-600/20 to-yellow-900/20 border-yellow-500/20 hover:border-yellow-500/40',
  drama: 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/20 hover:border-emerald-500/40',
  thriller: 'from-purple-600/20 to-purple-900/20 border-purple-500/20 hover:border-purple-500/40',
  horror: 'from-red-800/20 to-red-950/20 border-red-700/20 hover:border-red-700/40',
  fantasy: 'from-blue-600/20 to-blue-900/20 border-blue-500/20 hover:border-blue-500/40',
  mystery: 'from-indigo-600/20 to-indigo-900/20 border-indigo-500/20 hover:border-indigo-500/40',
  historical: 'from-amber-600/20 to-amber-900/20 border-amber-500/20 hover:border-amber-500/40',
  'sci-fi': 'from-cyan-600/20 to-cyan-900/20 border-cyan-500/20 hover:border-cyan-500/40',
};

export default function GenreGrid({ genres }: GenreGridProps) {
  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No genres available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {genres.map((genre) => (
        <Link
          key={genre.slug}
          href={`/genre/${genre.slug}`}
          className={`
            group relative overflow-hidden rounded-xl p-4 border bg-gradient-to-br text-center transition-all duration-200
            ${genreColors[genre.slug] || 'from-gray-600/20 to-gray-800/20 border-gray-500/20 hover:border-emerald-500/40'}
          `}
        >
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
            {genre.name}
          </span>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
