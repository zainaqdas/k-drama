import Link from 'next/link';
import { Play } from 'lucide-react';
import type { MediaItem } from '@/lib/api';
import { extractEpisodeSlug } from '@/lib/api';

interface EpisodeListProps {
  episodes: MediaItem[];
  dramaSlug?: string;
}

export default function EpisodeList({ episodes, dramaSlug }: EpisodeListProps) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No episodes available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
      {episodes.map((ep, index) => {
        const epSlug = extractEpisodeSlug(ep.url);
        const isAvailable = !!epSlug;
        const epNum = index + 1;

        return (
          <Link
            key={index}
            href={isAvailable ? `/watch/${epSlug}` : '#'}
            className={`
              group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center
              ${
                isAvailable
                  ? 'bg-surface border-white/5 hover:border-emerald-500/30 hover:bg-surface-light cursor-pointer'
                  : 'bg-surface/50 border-white/5 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* Episode number */}
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:bg-emerald-500/20 transition-colors">
              <span className="text-sm font-bold text-emerald-400">{epNum}</span>
            </div>

            {/* Title */}
            <span className="text-xs text-gray-300 line-clamp-1 leading-relaxed">
              {ep.title}
            </span>

            {/* Status */}
            {ep.episodeLabel && (
              <span className="mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 rounded">
                {ep.episodeLabel}
              </span>
            )}

            {/* Hover overlay */}
            {isAvailable && (
              <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-6 h-6 text-emerald-400" />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
