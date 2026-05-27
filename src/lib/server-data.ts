// Server-only data helper — calls scrapers directly instead of self-referencing HTTP
// This avoids deadlocks on Vercel serverless where server components can't fetch their own API

import {
  scrapeHomepage,
  scrapeDramaDetail,
  scrapeEpisodePage,
  scrapeGenre,
  scrapeGenreList,
  scrapeDramaList,
  scrapeCategory,
  scrapeCategories,
  scrapeRecentlyAdded,
  scrapeCalendar,
} from '@/scraper/scraper';

import type {
  HomepageData,
  DramaDetail,
  EpisodePage,
  Genre,
  Category,
  PaginatedItems,
  CalendarItem,
} from './api';

export async function getHomepage(): Promise<HomepageData> {
  return (await scrapeHomepage()) as HomepageData;
}

export async function getDramaDetail(slug: string): Promise<DramaDetail> {
  return (await scrapeDramaDetail(slug)) as DramaDetail;
}

export async function getEpisodePage(slug: string): Promise<EpisodePage> {
  return (await scrapeEpisodePage(slug)) as EpisodePage;
}

export async function getGenreList(): Promise<Genre[]> {
  return (await scrapeGenreList()) as Genre[];
}

export async function getGenrePage(slug: string, page = 1): Promise<PaginatedItems> {
  const data = await scrapeGenre(slug, page);
  return { genre: slug, page: data.page, items: data.items } as PaginatedItems;
}

export async function getDramaList(letter: string, page = 1): Promise<PaginatedItems> {
  const data = await scrapeDramaList(letter, page);
  return { letter, page: data.page, items: data.items } as PaginatedItems;
}

export async function getCategoryPage(slug: string, page = 1): Promise<PaginatedItems> {
  const data = await scrapeCategory(slug, page);
  return { category: slug, page: data.page, items: data.items } as PaginatedItems;
}

export async function getCategories(): Promise<Category[]> {
  return (await scrapeCategories()) as Category[];
}

export async function getRecentlyAdded(type: string, page = 1): Promise<PaginatedItems> {
  const data = await scrapeRecentlyAdded(type, page);
  return { type, page: data.page, items: data.items } as PaginatedItems;
}

export async function getCalendar(): Promise<CalendarItem[]> {
  return (await scrapeCalendar()) as CalendarItem[];
}
