import { NextRequest, NextResponse } from 'next/server';
import { scrapeRecentlyAdded } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  try {
    const data = await scrapeRecentlyAdded(type, page);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /recent]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch recently added' }, { status: 500 });
  }
}
