// API client — calls internal Next.js API routes

const API_BASE = '';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error: ${res.status} ${res.statusText}${text ? ': ' + text.slice(0, 100) : ''}`);
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HomepageData {
  recentDrama: MediaItem[];
  recentMovie: MediaItem[];
  recentKshow: MediaItem[];
  popular: MediaItem[];
  comingEps: { title: string; url: string }[];
}

export interface MediaItem {
  title: string;
  url: string;
  episodeLabel?: string;
  timeAgo?: string;
  thumbnail: string;
  description?: string;
}

export interface DramaDetail {
  title: string;
  description: string;
  thumbnail: string;
  meta: {
    episodes: string;
    airsOn: string;
    network: string;
    duration: string;
    country: string;
    status: string;
    released: string;
    genre: string;
    otherName: string;
  };
  cast: { name: string; url: string }[];
  episodes: MediaItem[];
}

export interface EpisodePage {
  title: string;
  url: string;
  dramaUrl: string;
  breadcrumbs: { text: string; url: string }[];
  navigation: { prev: string; next: string };
  servers: { name: string; url: string; dataId: string }[];
}

export interface VideoData {
  videoSources: { src: string; type: string }[];
  iframes: { src: string; label?: string }[];
  videoHosts: string[];
  networkVideoUrls: string[];
  jsVariables: { [key: string]: string };
  serversClicked: { name: string; success: boolean }[];
  error?: string;
}

export interface Genre {
  name: string;
  slug: string;
  url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  url: string;
}

export interface PaginatedItems {
  type?: string;
  genre?: string;
  category?: string;
  letter?: string;
  page: number;
  items: MediaItem[];
}

export interface CalendarItem {
  title: string;
  url: string;
  date: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getHomepage(): Promise<HomepageData> {
  const json = await fetchJSON<{ success: boolean; data: HomepageData }>('/api/home');
  return json.data;
}

export async function getDramaDetail(slug: string): Promise<DramaDetail> {
  const json = await fetchJSON<{ success: boolean; data: DramaDetail }>(
    `/api/drama-detail/${encodeURIComponent(slug)}`
  );
  return json.data;
}

export async function getEpisodePage(slug: string): Promise<EpisodePage> {
  const json = await fetchJSON<{ success: boolean; data: EpisodePage }>(
    `/api/episode/${encodeURIComponent(slug)}`
  );
  return json.data;
}

export async function getVideoUrls(
  slug: string,
  wait = 8000,
  clickWait = 3000
): Promise<VideoData> {
  const json = await fetchJSON<{ success: boolean; data: VideoData }>(
    `/api/episode/${encodeURIComponent(slug)}/video?wait=${wait}&clickWait=${clickWait}`
  );
  return json.data;
}

export async function searchDrama(query: string): Promise<MediaItem[]> {
  const json = await fetchJSON<{ success: boolean; data: MediaItem[] }>(
    `/api/search?q=${encodeURIComponent(query)}`
  );
  return json.data;
}

export async function getGenreList(): Promise<Genre[]> {
  const json = await fetchJSON<{ success: boolean; data: Genre[] }>('/api/genres');
  return json.data;
}

export async function getGenrePage(
  slug: string,
  page = 1
): Promise<PaginatedItems> {
  const json = await fetchJSON<{ success: boolean; data: PaginatedItems }>(
    `/api/genre/${encodeURIComponent(slug)}?page=${page}`
  );
  return json.data;
}

export async function getCategories(): Promise<Category[]> {
  const json = await fetchJSON<{ success: boolean; data: Category[] }>(
    '/api/categories'
  );
  return json.data;
}

export async function getCategoryPage(
  slug: string,
  page = 1
): Promise<PaginatedItems> {
  const json = await fetchJSON<{ success: boolean; data: PaginatedItems }>(
    `/api/category/${encodeURIComponent(slug)}?page=${page}`
  );
  return json.data;
}

export async function getDramaList(
  letter: string,
  page = 1
): Promise<PaginatedItems> {
  const json = await fetchJSON<{ success: boolean; data: PaginatedItems }>(
    `/api/drama-list/${letter}?page=${page}`
  );
  return json.data;
}

export async function getRecentlyAdded(
  type: string,
  page = 1
): Promise<PaginatedItems> {
  const json = await fetchJSON<{ success: boolean; data: PaginatedItems }>(
    `/api/recent/${type}?page=${page}`
  );
  return json.data;
}

export async function getCalendar(): Promise<CalendarItem[]> {
  const json = await fetchJSON<{ success: boolean; data: CalendarItem[] }>(
    '/api/calendar'
  );
  return json.data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract drama slug from a URL like https://.../drama-detail/slug/ */
export function extractSlug(url: string): string {
  const match = url.match(/\/drama-detail\/([^/]+)/);
  return match ? match[1] : '';
}

/** Extract episode slug from a URL like https://.../slug-episode-1/ */
export function extractEpisodeSlug(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

/** Build absolute URL for thumbnail (some come as relative paths) */
export function resolveThumbnail(src: string): string {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  return `https:${src.startsWith('//') ? src : `//${src}`}`;
}
