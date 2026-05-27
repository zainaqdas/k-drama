'use client';

import { useState, useEffect } from 'react';
import { getDramaDetail } from '@/lib/api';
import EpisodeList from '@/components/EpisodeList';
import type { DramaDetail } from '@/lib/api';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Globe,
  Tv,
  Star,
  Tag,
  BookOpen,
  Heart,
  Share2,
} from 'lucide-react';

interface Props {
  slug: string;
}

export default function DramaDetailClient({ slug }: Props) {
  const [data, setData] = useState<DramaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getDramaDetail(slug);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drama');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading drama details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-400">{error || 'Drama not found'}</p>
      </div>
    );
  }

  const metaInfo = [
    { icon: <Calendar className="w-4 h-4" />, label: 'Released', value: data.meta.released },
    { icon: <Tv className="w-4 h-4" />, label: 'Status', value: data.meta.status },
    { icon: <Clock className="w-4 h-4" />, label: 'Duration', value: data.meta.duration },
    { icon: <Globe className="w-4 h-4" />, label: 'Country', value: data.meta.country },
    { icon: <Star className="w-4 h-4" />, label: 'Episodes', value: data.meta.episodes },
    { icon: <Tv className="w-4 h-4" />, label: 'Network', value: data.meta.network },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Other Name', value: data.meta.otherName },
  ].filter((m) => m.value);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        {data.thumbnail && (
          <div className="absolute inset-0 opacity-20">
            <img src={data.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster */}
            <div className="shrink-0 w-40 sm:w-48 mx-auto sm:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl border border-white/10">
                {data.thumbnail ? (
                  <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-800/30 to-surface flex items-center justify-center">
                    <Tv className="w-12 h-12 text-emerald-500/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {data.title}
              </h1>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                {data.meta.status && (
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    data.meta.status.toLowerCase().includes('ongoing')
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {data.meta.status}
                  </span>
                )}
                {data.meta.country && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                    {data.meta.country}
                  </span>
                )}
                {data.meta.episodes && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                    {data.meta.episodes} Episodes
                  </span>
                )}
                {data.meta.genre && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                    {data.meta.genre}
                  </span>
                )}
              </div>

              {/* Description */}
              {data.description && (
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl mb-6">
                  {data.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {data.episodes.length > 0 && (
                  <a
                    href={`/watch/${extractEpisodeSlugLocal(data.episodes[0].url)}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <polygon points="8,5 8,19 20,12" />
                    </svg>
                    Watch Now
                  </a>
                )}
                <button className="btn-outline inline-flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorite
                </button>
                <button className="btn-outline inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Meta info grid */}
        {metaInfo.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {metaInfo.map((info, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5">
                <div className="text-emerald-400 shrink-0">{info.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">{info.label}</p>
                  <p className="text-sm text-gray-200 truncate">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Genre tags */}
        {data.meta.genre && (
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {data.meta.genre.split(',').map((g, i) => (
                <span key={i} className="text-xs text-gray-400 bg-surface-light px-2 py-1 rounded-md">
                  {g.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {data.cast && data.cast.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-400" />
              Cast
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.cast.map((actor, i) => (
                <span key={i} className="text-sm text-gray-300 bg-surface-light px-3 py-1.5 rounded-lg border border-white/5">
                  {actor.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Episodes */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Tv className="w-5 h-5 text-emerald-400" />
            Episodes ({data.episodes.length})
          </h2>
          <EpisodeList episodes={data.episodes} />
        </div>
      </div>
    </div>
  );
}

function extractEpisodeSlugLocal(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}
