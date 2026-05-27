import axios from 'axios';
import * as cheerio from 'cheerio';
import { BASE_URL, WP_API, USER_AGENT, REQUEST_TIMEOUT } from './config.js';

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------
const http = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'User-Agent': USER_AGENT },
});

/**
 * Fetch HTML and return a cheerio instance.
 * Returns null on failure so callers can handle gracefully.
 */
async function fetchPage(path) {
  try {
    const { data } = await http.get(path);
    return cheerio.load(data);
  } catch (err) {
    console.error(`[fetchPage] Failed to fetch ${BASE_URL}${path}: ${err.message}`);
    return null;
  }
}

/** Simple URL-based dedup helper */
function dedupeByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

/** Sanitize a path segment */
function sanitizeSlug(slug) {
  // WordPress slugs are already sanitized; just encode for URL safety
  return encodeURIComponent(slug);
}

// ---------------------------------------------------------------------------
// 1.  HOMEPAGE – recent dramas / movies / kshows + popular + coming eps
// ---------------------------------------------------------------------------
export async function scrapeHomepage() {
  const $ = await fetchPage('/');
  if (!$) return { recentDrama: [], recentMovie: [], recentKshow: [], popular: [], comingEps: [] };

  const parseTabItems = (tabIndex) => {
    const items = [];
    const tab = $('.block-tab .tab-container').eq(tabIndex);
    tab.find('.list-episode-item li, .list-episode-item > div').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').first();
      const href = link.attr('href');
      const title = link.attr('title') || $el.find('h3').text().trim() || $el.text().trim();
      const episodeLabel = $el.find('.type').text().trim() || '';
      const time = $el.find('span').last().text().trim();
      const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
      if (href && title) {
        items.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, episodeLabel, timeAgo: time, thumbnail: img });
      }
    });
    return items;
  };

  const recentDrama = parseTabItems(0);
  const recentMovie = parseTabItems(1);
  const recentKshow = parseTabItems(2);

  const popular = [];
  // Try multiple selectors for the popular/drama grid on homepage
  $('.tab-content .filter-item a, .block-item a, .popular-series a, .most-popular a, .filter-item a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const title = $el.attr('title') || $el.text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    if (href && title && !popular.some((p) => p.url === href)) {
      popular.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, thumbnail: img });
    }
  });

  const comingEps = [];
  $('.coming-episodes li, .block-tab .tab-container').last().find('li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').first();
    const href = link.attr('href');
    const text = link.text().trim();
    if (href && text) {
      comingEps.push({ title: text, url: href.startsWith('http') ? href : BASE_URL + href });
    }
  });

  return { recentDrama, recentMovie, recentKshow, popular, comingEps };
}

// ---------------------------------------------------------------------------
// 2.  DRAMA / SERIES DETAIL
// ---------------------------------------------------------------------------
export async function scrapeDramaDetail(slug) {
  const cleanSlug = sanitizeSlug(slug);
  const $ = await fetchPage('/drama-detail/' + cleanSlug + '/');
  if (!$) return { title: '', description: '', thumbnail: '', meta: {}, cast: [], episodes: [] };

  const title = $('h1').first().text().trim() || $('.title h1').text().trim();
  const description = $('.description p, .content p, .summary p').first().text().trim();
  const thumbnail = $('.detail-thumb img, .poster img, .series-poster img').attr('src') || '';

  // Metadata – extract from structured info blocks with colon separator
  const structured = { episodes: '', airsOn: '', network: '', duration: '', country: '', status: '', released: '', genre: '', otherName: '' };
  $('.detail-info p, .detail-info span, .info-meta p, .series-info p, .detail-specs p, .detail-specs span, .info-item').each((_, el) => {
    const text = $(el).text().trim();
    const colonIdx = text.indexOf(':');
    if (colonIdx > 0) {
      const key = text.slice(0, colonIdx).trim().toLowerCase();
      const val = text.slice(colonIdx + 1).trim();
      if (key.includes('episode')) structured.episodes = val;
      else if (key.includes('airs')) structured.airsOn = val;
      else if (key.includes('network')) structured.network = val;
      else if (key.includes('duration')) structured.duration = val;
      else if (key.includes('country')) structured.country = val;
      else if (key.includes('status')) structured.status = val;
      else if (key.includes('released')) structured.released = val;
      else if (key.includes('genre')) structured.genre = val;
      else if (key.includes('other name')) structured.otherName = val;
    }
  });

  // Cast / stars
  const cast = [];
  $('.slider-star a, .cast-list a, .star-list a').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href');
    if (name) cast.push({ name, url: href ? (href.startsWith('http') ? href : BASE_URL + href) : '' });
  });

  // Episode list
  const episodes = [];
  $('.list-episode-item-2 a, .list-episode-item a, .all-episode a, .episode-list a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const epTitle = $el.find('h3').text().trim() || $el.text().trim();
    const epLabel = $el.find('.type').text().trim() || 'SUB';
    const timeAgo = $el.find('span.date, .time').text().trim() || '';
    if (href && epTitle) {
      episodes.push({
        title: epTitle,
        url: href.startsWith('http') ? href : BASE_URL + href,
        label: epLabel,
        timeAgo,
      });
    }
  });

  return { title, description, thumbnail, meta: structured, cast: dedupeByUrl(cast), episodes: dedupeByUrl(episodes) };
}

// ---------------------------------------------------------------------------
// 3.  SEARCH
// ---------------------------------------------------------------------------
export async function searchDrama(query) {
  const $ = await fetchPage('/?s=' + encodeURIComponent(query));
  if (!$) return [];

  const results = [];
  $('.list-episode-item li, article, .post').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').first();
    const href = link.attr('href');
    const title = link.attr('title') || $el.find('h3').text().trim() || link.text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    const desc = $el.find('p, .description').first().text().trim();
    if (href && title) {
      results.push({
        title,
        url: href.startsWith('http') ? href : BASE_URL + href,
        thumbnail: img,
        description: desc,
      });
    }
  });

  return dedupeByUrl(results);
}

// ---------------------------------------------------------------------------
// 4.  GENRE PAGE
// ---------------------------------------------------------------------------
export async function scrapeGenre(genreSlug, page = 1) {
  const cleanSlug = sanitizeSlug(genreSlug);
  const $ = await fetchPage('/genre/' + cleanSlug + '/page/' + page + '/');
  if (!$) return { genre: genreSlug, page, items: [] };

  const items = [];
  $('.list-episode-item a, .post-item a, .block-item a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const title = $el.attr('title') || $el.find('h3').text().trim() || $el.text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    if (href && title) {
      items.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, thumbnail: img });
    }
  });

  return { genre: genreSlug, page, items: dedupeByUrl(items) };
}

// ---------------------------------------------------------------------------
// 5.  DRAMA LIST (alphabetical)
// ---------------------------------------------------------------------------
export async function scrapeDramaList(letter = 'a', page = 1) {
  const $ = await fetchPage('/drama-list/drama-start-with-' + letter + '/page/' + page + '/');
  if (!$) return { letter, page, items: [] };

  const items = [];
  $('.list-episode-item a, .drama-item a, .post-item a, .block-item a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const title = $el.attr('title') || $el.find('h3').text().trim() || $el.text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    if (href && title) {
      items.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, thumbnail: img });
    }
  });

  return { letter, page, items: dedupeByUrl(items) };
}

// ---------------------------------------------------------------------------
// 6.  CATEGORY PAGE (via WordPress categories)
// ---------------------------------------------------------------------------
export async function scrapeCategory(categorySlug, page = 1) {
  const cleanSlug = sanitizeSlug(categorySlug);
  const $ = await fetchPage('/category/' + cleanSlug + '/page/' + page + '/');
  if (!$) return { category: categorySlug, page, items: [] };

  const items = [];
  // Category pages use class="filter-item" for drama entries
  $('.filter-item a, .list-episode-item a, .post-item a, article a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const title = $el.attr('title') || $el.find('h3').text().trim() || $el.text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    if (href && title) {
      items.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, thumbnail: img });
    }
  });

  return { category: categorySlug, page, items: dedupeByUrl(items) };
}

// ---------------------------------------------------------------------------
// 7.  CALENDAR / SCHEDULE
// ---------------------------------------------------------------------------
export async function scrapeCalendar() {
  const $ = await fetchPage('/calendar/');
  if (!$) return [];

  const calendar = [];
  $('.calendar-item, .schedule-item, .coming-ep-item, .scheduled-item, table tr, #calendar a, .calendar a').each((_, el) => {
    const $el = $(el);
    const link = $el.is('a') ? $el : $el.find('a').first();
    const href = link.attr('href');
    const title = link.text().trim();
    const date = $el.find('.date, .day, td').first().text().trim();
    if (href && title && href !== '#') {
      calendar.push({ title, url: href.startsWith('http') ? href : BASE_URL + href, date });
    }
  });

  return dedupeByUrl(calendar);
}

// ---------------------------------------------------------------------------
// 8.  LIST ALL GENRES
// ---------------------------------------------------------------------------
export async function scrapeGenreList() {
  const $ = await fetchPage('/');
  if (!$) return [];

  const genres = [];
  // Find genre links broadly — the selector classes differ across subdomains
  $('a[href*="/genre/"]').each((_, el) => {
    const href = $(el).attr('href');
    const name = $(el).text().trim();
    if (href && name && !genres.some((g) => g.name === name)) {
      const slug = href.replace(/.*\/genre\//, '').replace(/\/.*/, '');
      genres.push({ name, slug, url: href.startsWith('http') ? href : BASE_URL + href });
    }
  });
  return genres;
}

// ---------------------------------------------------------------------------
// 9.  LIST CATEGORIES (via WordPress REST API)
// ---------------------------------------------------------------------------
export async function scrapeCategories() {
  try {
    const { data } = await http.get(WP_API + '/categories?per_page=50&hide_empty=true');
    return data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
      url: BASE_URL + '/category/' + cat.slug + '/',
    }));
  } catch (err) {
    console.error('[scrapeCategories] Failed:', err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 10. RECENTLY ADDED (paginated)
// ---------------------------------------------------------------------------
export async function scrapeRecentlyAdded(type = 'drama', page = 1) {
  const path = type === 'movie' ? '/recent-movie/' : type === 'kshow' ? '/recent-kshow/' : '/recent-drama/';
  const $ = await fetchPage(page > 1 ? path + 'page/' + page + '/' : path);
  if (!$) return { type, page, items: [] };

  const items = [];
  $('.list-episode-item li, .list-episode-item a').each((_, el) => {
    const $el = $(el).closest('a').length ? $(el).closest('a') : $(el);
    const href = $el.attr('href');
    const title = $el.attr('title') || $el.find('h3').text().trim() || $el.text().trim();
    const episodeLabel = $el.find('.type').text().trim() || '';
    const timeAgo = $el.find('span').last().text().trim();
    const img = $el.find('img').attr('data-original') || $el.find('img').attr('src') || '';
    if (href && title) {
      items.push({
        title,
        url: href.startsWith('http') ? href : BASE_URL + href,
        episodeLabel,
        timeAgo,
        thumbnail: img,
      });
    }
  });

  return { type, page, items: dedupeByUrl(items) };
}

// ---------------------------------------------------------------------------
// 11. EPISODE PAGE – parse static content (before JS video load)
// NOTE: Episode pages often redirect to the homepage if accessed without JS.
//       The Puppeteer-based endpoint (/episode/:slug/video) handles JS rendering.
// ---------------------------------------------------------------------------
export async function scrapeEpisodePage(episodeSlug) {
  const cleanSlug = sanitizeSlug(episodeSlug);
  const $ = await fetchPage('/' + cleanSlug + '/');
  if (!$) return { title: '', url: '', dramaUrl: '', breadcrumbs: [], navigation: { prev: '', next: '' }, servers: [] };

  const title = $('h1').first().text().trim() || $('title').text().trim();
  const breadcrumbs = [];
  $('.breadcrumb a, .breadcrumbs a').each((_, el) => {
    breadcrumbs.push({ text: $(el).text().trim(), url: $(el).attr('href') || '' });
  });

  const dramaLink = $('a[href*="/drama-detail/"]').first();
  const dramaUrl = dramaLink.attr('href') || '';

  const prevEp = $('a.prev-episode, a.previous-episode').attr('href') || '';
  const nextEp = $('a.next-episode, a.next').attr('href') || '';

  const servers = [];
  $('.server-list a, .server-option a, .watch-server a, .server-item a').each((_, el) => {
    const $el = $(el);
    servers.push({
      name: $el.text().trim(),
      url: $el.attr('href') || '',
      dataId: $el.attr('data-id') || $el.attr('data-server') || '',
    });
  });

  return {
    title,
    url: BASE_URL + '/' + cleanSlug + '/',
    dramaUrl: dramaUrl.startsWith('http') ? dramaUrl : BASE_URL + dramaUrl,
    breadcrumbs,
    navigation: { prev: prevEp, next: nextEp },
    servers,
  };
}
