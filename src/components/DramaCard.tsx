'use client';

import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import type { MediaItem } from '@/lib/api';
import { extractSlug } from '@/lib/api';

interface DramaCardProps {
  item: MediaItem;
  index?: number;
}

export default function DramaCard({ item, index = 0 }: DramaCardProps) {
  const delayClass = index < 6 ? `animate-fade-in-d${Math.min(index + 1, 6)}` : '';
  const slug = extractSlug(item.url);

  // Use the drama-detail page if we can extract a slug, otherwise use the raw URL
  const detailUrl = slug ? `/drama/${slug}` : item.url;

  return (
    <Link
      href={detailUrl}
      className={`group card-hover block rounded-xl overflow-hidden bg-surface border border-white/5 ${delayClass}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        {/* Fallback */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-surface flex items-center justify-center"
          style={{ display: item.thumbnail ? 'none' : 'flex' }}
        >
          <Play className="w-12 h-12 text-emerald-500/50" />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Episode badge */}
        {item.episodeLabel && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white rounded-md">
              {item.episodeLabel}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
          {item.title}
        </h3>
        {item.timeAgo && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-[11px] text-gray-500">{item.timeAgo}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
