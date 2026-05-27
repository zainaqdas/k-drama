'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, AlertCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import type { VideoData } from '@/lib/api';

interface VideoPlayerProps {
  slug: string;
  initialData?: VideoData | null;
}

export default function VideoPlayer({ slug, initialData }: VideoPlayerProps) {
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(initialData || null);
  const [selectedSource, setSelectedSource] = useState(0);
  const [selectedIframe, setSelectedIframe] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (initialData) return;

    async function fetchVideo() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/video?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Failed to load video');
        const json = await res.json();
        setVideoData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [slug, initialData]);

  if (loading) {
    return (
      <div className="aspect-video rounded-xl bg-surface flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading video player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video rounded-xl bg-surface flex flex-col items-center justify-center gap-3 p-6">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-400 text-center">{error}</p>
        <p className="text-xs text-gray-500 text-center">
          The video may be unavailable. Try refreshing or use an external player.
        </p>
      </div>
    );
  }

  const hasDirectSource = videoData?.videoSources && videoData.videoSources.length > 0;
  const hasIframe = videoData?.iframes && videoData.iframes.length > 0;
  const hasNetworkUrls = videoData?.networkVideoUrls && videoData.networkVideoUrls.length > 0;

  // Prefer direct video sources, then iframes, then network URLs
  const currentSource = hasDirectSource
    ? videoData!.videoSources[selectedSource]
    : null;

  const currentIframe = hasIframe
    ? videoData!.iframes[selectedIframe]
    : null;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
        {currentSource ? (
          <video
            key={currentSource.src}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          >
            <source src={currentSource.src} type={currentSource.type || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        ) : currentIframe ? (
          <iframe
            ref={iframeRef}
            src={currentIframe.src}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : hasNetworkUrls ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
            <LinkIcon className="w-10 h-10 text-emerald-400" />
            <p className="text-sm text-gray-300 text-center">
              Video stream URL found. Use an external player to play this stream.
            </p>
            <a
              href={videoData!.networkVideoUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Stream URL
            </a>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Play className="w-12 h-12 text-gray-600" />
            <p className="text-sm text-gray-500">No video sources found</p>
          </div>
        )}
      </div>

      {/* Source selector tabs */}
      {hasDirectSource && videoData!.videoSources.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {videoData!.videoSources.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedSource(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedSource === i
                  ? 'bg-emerald-600 text-white'
                  : 'bg-surface-light text-gray-400 hover:text-gray-200'
              }`}
            >
              Source {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Iframe tabs */}
      {hasIframe && videoData!.iframes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {videoData!.iframes.map((iframe, i) => (
            <button
              key={i}
              onClick={() => setSelectedIframe(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedIframe === i
                  ? 'bg-emerald-600 text-white'
                  : 'bg-surface-light text-gray-400 hover:text-gray-200'
              }`}
            >
              Server {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Network URLs block */}
      {hasNetworkUrls && (
        <details className="bg-surface rounded-xl border border-white/5">
          <summary className="px-4 py-3 text-sm font-medium text-gray-300 cursor-pointer hover:text-emerald-400 transition-colors">
            Direct Stream URLs ({videoData!.networkVideoUrls.length} found)
          </summary>
          <div className="px-4 pb-3 space-y-2">
            {videoData!.networkVideoUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <code className="flex-1 text-xs text-gray-400 bg-surface-light rounded px-2 py-1 truncate">
                  {url}
                </code>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
