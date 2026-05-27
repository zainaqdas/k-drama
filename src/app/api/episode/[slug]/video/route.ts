import { NextRequest, NextResponse } from 'next/server';
import { scrapeVideoUrls } from '@/scraper/playerScraper.js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const data = await scrapeVideoUrls(slug);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /episode/video]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Video resolution failed' },
      { status: 500 }
    );
  }
}
