import { NextRequest, NextResponse } from 'next/server';
import { scrapeDramaList } from '@/scraper/scraper.js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ letter: string }> }
) {
  const { letter } = await params;
  const cleanLetter = letter.toLowerCase();
  if (!/^[a-z]$/.test(cleanLetter)) {
    return NextResponse.json({ success: false, error: 'Letter must be a-z' }, { status: 400 });
  }
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  try {
    const data = await scrapeDramaList(cleanLetter, page);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /drama-list]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch drama list' }, { status: 500 });
  }
}
