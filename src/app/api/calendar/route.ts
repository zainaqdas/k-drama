import { NextResponse } from 'next/server';
import { scrapeCalendar } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await scrapeCalendar();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /calendar]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
