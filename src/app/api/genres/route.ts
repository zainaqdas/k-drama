import { NextResponse } from 'next/server';
import { scrapeGenreList } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await scrapeGenreList();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /genres]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch genres' }, { status: 500 });
  }
}
