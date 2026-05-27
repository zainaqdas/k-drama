import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <polygon points="8,5 8,19 20,12" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-emerald-400">Wave</span>
                <span className="text-sm font-semibold text-emerald-200 ml-1">DRAMA</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your premier destination for streaming the latest Asian dramas, K-Dramas, movies, and variety shows.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
              Browse
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Genres
                </Link>
              </li>
              <li>
                <Link href="/drama-list/a" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Drama List
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/category/korean-drama" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  K-Dramas
                </Link>
              </li>
              <li>
                <Link href="/category/chinese-drama" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Chinese Dramas
                </Link>
              </li>
              <li>
                <Link href="/category/japanese-drama" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Japanese Dramas
                </Link>
              </li>
              <li>
                <Link href="/category/thailand-drama" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Thai Dramas
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
              Info
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/calendar" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                  All Genres
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} WaveDrama. All content is sourced from third-party providers.
          </p>
        </div>
      </div>
    </footer>
  );
}
