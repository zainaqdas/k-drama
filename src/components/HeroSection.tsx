import Link from 'next/link';
import { Play, TrendingUp, Calendar } from 'lucide-react';
import type { HomepageData } from '@/lib/api';

interface HeroSectionProps {
  data: HomepageData;
}

export default function HeroSection({ data }: HeroSectionProps) {
  const featured = data.popular?.slice(0, 5) || [];

  if (featured.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">
            Welcome to WaveDrama
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stream the latest Asian dramas, K-Dramas, movies, and variety shows in HD quality.
          </p>
        </div>
      </div>
    );
  }

  const hero = featured[0];
  const heroSlug = hero.url.match(/\/drama-detail\/([^/]+)/)?.[1] || '';

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface to-background" />
      {hero.thumbnail && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={hero.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Hero content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Popular Now
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {hero.title}
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Watch the latest episodes in HD with English subtitles. Stream your favorite Asian dramas anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {heroSlug && (
                <Link
                  href={`/drama/${heroSlug}`}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base"
                >
                  <Play className="w-5 h-5 fill-white" />
                  View Details
                </Link>
              )}
              <Link
                href="/search"
                className="btn-outline inline-flex items-center gap-2 px-6 py-3 text-base"
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Hero thumbnail */}
          <div className="shrink-0">
            <div className="relative">
              <div className="w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/10">
                {hero.thumbnail ? (
                  <img
                    src={hero.thumbnail}
                    alt={hero.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800/30 to-surface flex items-center justify-center">
                    <Play className="w-16 h-16 text-emerald-500/30" />
                  </div>
                )}
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full -z-10" />
            </div>
          </div>
        </div>

        {/* Popular row */}
        {featured.length > 1 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Trending</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {featured.slice(1).map((item, i) => {
                const s = item.url.match(/\/drama-detail\/([^/]+)/)?.[1] || '';
                return (
                  <Link
                    key={i}
                    href={s ? `/drama/${s}` : item.url}
                    className="shrink-0 w-32 group"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface-light border border-white/5">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-emerald-500/30" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
