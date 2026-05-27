import { NextRequest, NextResponse } from 'next/server';
import { searchDrama } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  if (!q.trim()) {
    return NextResponse.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 });
  }
  try {
    const data = await searchDrama(q);
    return NextResponse.json({ success: true, query: q, data });
  } catch (err) {
    console.error('[API /search]', err);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
