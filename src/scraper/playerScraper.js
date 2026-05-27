import axios from 'axios';
import * as cheerio from 'cheerio';
import { BASE_URL, USER_AGENT, REQUEST_TIMEOUT } from './config.js';
import { scrapeEpisodePage } from './scraper.js';

// ---------------------------------------------------------------------------
// Cheerio-based video resolution — no Puppeteer needed!
//
// Dramacool episode pages have server buttons whose URLs point to third-party
// video embed hosts (e.g. gomoplayer.com, etc.). These are the same URLs that
// dramacool itself loads into iframes. We extract them and return them as
// iframe sources — no headless browser required.
// ---------------------------------------------------------------------------

const http = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: { 'User-Agent': USER_AGENT },
});

/**
 * Given a list of server items from the episode page, resolve them into
 * iframe embed URLs (and optionally direct video sources if the embed
 * page is static enough).
 *
 * @param {Array<{name:string, url:string}>} servers
 * @returns {Promise<{iframes:Array<{src:string, label:string}>, videoSources:Array<{src:string, type:string}>}>}
 */
export async function resolveServerUrls(servers) {
  const iframes = [];
  const videoSources = [];

  // First, add all server URLs as iframe sources (always works)
  for (const server of servers) {
    if (server.url) {
      iframes.push({ src: server.url, label: server.name || 'Server' });
    }
  }

  // Try to resolve embed pages in parallel (best-effort, may yield direct video URLs)
  const resolutionPromises = servers
    .filter((s) => s.url)
    .map(async (server) => {
      try {
        const resolved = await tryResolveEmbed(server.url);
        return { server, resolved };
      } catch {
        return null;
      }
    });

  const results = await Promise.allSettled(resolutionPromises);
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      const { server, resolved } = result.value;
      if (resolved.videoSources?.length) {
        videoSources.push(
          ...resolved.videoSources.map((s) => ({ ...s, label: server.name }))
        );
      }
    }
  }

  return { iframes, videoSources };
}

/**
 * Attempt to fetch an embed page and extract video sources from it.
 * This is best-effort — many embed hosts are JS-rendered and won't
 * have static video tags.
 */
async function tryResolveEmbed(embedUrl) {
  const { data } = await http.get(embedUrl, {
    timeout: 10000,
    headers: {
      'User-Agent': USER_AGENT,
      Referer: BASE_URL + '/',
    },
  });

  const $ = cheerio.load(data);
  const sources = [];

  // Look for <video> / <source> tags in the static HTML
  $('video source, video').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const type = $(el).attr('type') || 'video/mp4';
    if (src) sources.push({ src, type });
  });

  // Look for iframes inside the embed page (nested embeds)
  const nestedIframes = [];
  $('iframe').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src) nestedIframes.push(src);
  });

  // Look for common JS variable patterns
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    const patterns = [
      /(?:videoUrl|video_link|file|src)\s*[=:]\s*['"]([^'"]+\.(?:m3u8|mp4))['"]/,
      /(?:playerSrc|link)\s*[=:]\s*['"]([^'"]+)['"]/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        sources.push({ src: match[1], type: 'application/x-mpegURL' });
      }
    }
  });

  return { videoSources: sources, iframes: nestedIframes };
}

/**
 * Legacy alias — resolves server embed URLs from an episode slug.
 * Used by the /api/episode/:slug/video endpoint.
 *
 * @param {string} episodeSlug
 * @param {object} [opts]  Ignored in this implementation (no Puppeteer timing needed)
 * @returns {Promise<object>} Video sources and iframes
 */
export async function scrapeVideoUrls(episodeSlug, opts = {}) {
  const episodeData = await scrapeEpisodePage(episodeSlug);

  const url = `${BASE_URL}/${episodeSlug.replace(/^\/+/, '')}/`;

  const resolved = await resolveServerUrls(episodeData.servers || []);

  return {
    pageUrl: url,
    title: episodeData.title || '',
    videoSources: resolved.videoSources,
    iframes: resolved.iframes,
    videoHosts: resolved.iframes.map((f) => {
      try {
        const host = new URL(f.src).hostname;
        return host;
      } catch {
        return f.src;
      }
    }),
    networkVideoUrls: [],
    serversClicked: episodeData.servers?.map((s) => s.name) || [],
    jsVariables: {},
    obfuscatedData: {},
    note: 'Video resolution uses server embed URLs (no headless browser). If videos don\'t play, try opening the server link directly.',
  };
}

/**
 * Legacy alias — resolved via cheerio.
 */

