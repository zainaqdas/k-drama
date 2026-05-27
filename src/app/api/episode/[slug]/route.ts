import { NextRequest, NextResponse } from 'next/server';
import { scrapeEpisodePage } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const data = await scrapeEpisodePage(slug);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /episode]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch episode page' }, { status: 500 });
  }
}
