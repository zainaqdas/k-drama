import { NextResponse } from 'next/server';
import { scrapeHomepage } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await scrapeHomepage();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /home]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch homepage' }, { status: 500 });
  }
}
