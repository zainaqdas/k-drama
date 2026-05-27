import { NextRequest, NextResponse } from 'next/server';
import { scrapeVideoUrls } from '@/scraper/playerScraper.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for Puppeteer

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const waitMs = parseInt(request.nextUrl.searchParams.get('wait') || '10000', 10);
  const clickWaitMs = parseInt(request.nextUrl.searchParams.get('clickWait') || '4000', 10);

  try {
    const data = await scrapeVideoUrls(slug, { waitMs, clickWaitMs });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /episode/video]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Video extraction failed' },
      { status: 500 }
    );
  }
}
