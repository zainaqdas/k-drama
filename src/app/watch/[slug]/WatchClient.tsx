'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEpisodePage, getVideoUrls } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import type { EpisodePage, VideoData } from '@/lib/api';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Server,
  ArrowLeft,
  ExternalLink,
  Film,
} from 'lucide-react';

interface Props {
  slug: string;
}

export default function WatchClient({ slug }: Props) {
  const [episodeData, setEpisodeData] = useState<EpisodePage | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);

        // Fetch episode data (servers, navigation) and video sources in parallel
        const [epData, vidData] = await Promise.all([
          getEpisodePage(slug),
          getVideoUrls(slug),
        ]);

        setEpisodeData(epData);
        setVideoData(vidData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load episode');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [slug]);

  // Derive iframe sources from video data or episode servers
  const iframeSources = videoData?.iframes?.length
    ? videoData.iframes
    : episodeData?.servers?.map((s) => ({ src: s.url, label: s.name })) || [];

  const [selectedServer, setSelectedServer] = useState(0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading episode...</p>
      </div>
    );
  }

  if (error || !episodeData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-400">{error || 'Episode not found'}</p>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  // Extract drama slug from breadcrumbs or URL
  const dramaSlug = episodeData.dramaUrl?.match(/\/drama-detail\/([^/]+)/)?.[1] || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        {episodeData.breadcrumbs?.map((crumb, i) => {
          const crumbSlug = crumb.url?.match(/\/drama-detail\/([^/]+)/)?.[1];
          return (
            <span key={i} className="flex items-center gap-2">
              <ChevronLeft className="w-3 h-3 rotate-180" />
              {crumbSlug ? (
                <Link href={`/drama/${crumbSlug}`} className="hover:text-emerald-400 transition-colors">
                  {crumb.text}
                </Link>
              ) : (
                <span className="text-gray-400">{crumb.text}</span>
              )}
            </span>
          );
        })}
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-gray-300">{episodeData.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">
        {episodeData.title}
      </h1>

      {/* Navigation between episodes */}
      <div className="flex items-center justify-between mb-6">
        {episodeData.navigation?.prev ? (
          <Link
            href={`/watch/${episodeData.navigation.prev.split('/').filter(Boolean).pop()}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Episode
          </Link>
        ) : (
          <div />
        )}

        {dramaSlug && (
          <Link
            href={`/drama/${dramaSlug}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <Film className="w-4 h-4" />
            All Episodes
          </Link>
        )}

        {episodeData.navigation?.next ? (
          <Link
            href={`/watch/${episodeData.navigation.next.split('/').filter(Boolean).pop()}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
          >
            Next Episode
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Video Player */}
      <div className="mb-6">
        <VideoPlayer
          slug={slug}
          initialData={videoData}
          iframeSources={iframeSources}
          selectedServer={selectedServer}
          onSelectServer={setSelectedServer}
        />
      </div>

      {/* Server Selector */}
      {iframeSources.length > 0 && (
        <div className="bg-surface rounded-xl border border-white/5 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-gray-200">Available Servers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {iframeSources.map((source, i) => (
              <button
                key={i}
                onClick={() => setSelectedServer(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                  selectedServer === i
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-surface-light text-gray-300 hover:text-emerald-400 border-white/5 hover:border-emerald-500/30'
                }`}
              >
                {source.label || `Server ${i + 1}`}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Videos are embedded from third-party hosts. If a server doesn&apos;t load, try a different one.
          </p>
        </div>
      )}

      {/* Fallback: Open in new tab links */}
      {episodeData.servers && episodeData.servers.length > 0 && (
        <div className="bg-surface rounded-xl border border-white/5 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-gray-200">Open in New Tab</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            If the embedded player doesn&apos;t work, open the stream directly:
          </p>
          <div className="flex flex-wrap gap-2">
            {episodeData.servers.map((server, i) => (
              <a
                key={i}
                href={server.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-light text-gray-300 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/5"
              >
                <ExternalLink className="w-3 h-3" />
                {server.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back to drama */}
      {dramaSlug && (
        <Link
          href={`/drama/${dramaSlug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Drama Details
        </Link>
      )}
    </div>
  );
}
