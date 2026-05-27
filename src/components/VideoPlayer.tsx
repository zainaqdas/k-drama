'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import type { VideoData } from '@/lib/api';

interface VideoPlayerProps {
  slug: string;
  initialData?: VideoData | null;
  iframeSources?: { src: string; label?: string }[];
  selectedServer?: number;
  onSelectServer?: (index: number) => void;
}

export default function VideoPlayer({
  slug,
  initialData,
  iframeSources = [],
  selectedServer = 0,
  onSelectServer,
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Show loading state while iframe loads
  useEffect(() => {
    setLoading(true);
    setEmbedError(false);
  }, [selectedServer, iframeSources]);

  const currentIframeSource =
    iframeSources.length > 0 && selectedServer < iframeSources.length
      ? iframeSources[selectedServer]
      : null;

  const hasDirectSource =
    initialData?.videoSources && initialData.videoSources.length > 0;

  const hasIframe = iframeSources.length > 0 || (initialData?.iframes && initialData.iframes.length > 0);

  // If we have direct video sources, show a native video player
  if (hasDirectSource) {
    const src = initialData!.videoSources[0];
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
        <video
          key={src.src}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
        >
          <source src={src.src} type={src.type || 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // If we have iframe sources, show the embed player
  if (hasIframe && currentIframeSource) {
    return (
      <div className="space-y-3">
        {/* Video Player Container */}
        <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}

          {embedError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-gray-300 text-center">
                This server&apos;s player could not be embedded directly.
              </p>
              <a
                href={currentIframeSource.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={currentIframeSource.src}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              onError={() => {
                setEmbedError(true);
                setLoading(false);
              }}
              onLoad={() => {
                setLoading(false);
              }}
            />
          )}
        </div>

        {/* Server selector tabs */}
        {iframeSources.length > 1 && onSelectServer && (
          <div className="flex flex-wrap gap-2">
            {iframeSources.map((source, i) => (
              <button
                key={i}
                onClick={() => onSelectServer(i)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedServer === i
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-light text-gray-400 hover:text-gray-200 border border-white/5'
                }`}
              >
                {source.label || `Server ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback: no sources at all
  return (
    <div className="aspect-video rounded-xl bg-surface flex flex-col items-center justify-center gap-3">
      <Play className="w-12 h-12 text-gray-600" />
      <p className="text-sm text-gray-500">No video sources available</p>
      <p className="text-xs text-gray-600 max-w-md text-center px-4">
        Try selecting a different server below, or open a server link in a new tab.
      </p>
    </div>
  );
}
