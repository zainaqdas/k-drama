import { NextRequest, NextResponse } from 'next/server';
import { scrapeGenre } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  try {
    const data = await scrapeGenre(slug, page);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /genre]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch genre page' }, { status: 500 });
  }
}
