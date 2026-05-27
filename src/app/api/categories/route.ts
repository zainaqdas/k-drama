import { NextResponse } from 'next/server';
import { scrapeCategories } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await scrapeCategories();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /categories]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}
