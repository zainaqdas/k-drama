import { NextRequest, NextResponse } from 'next/server';
import { scrapeEmbedUrl } from '@/scraper/playerScraper.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return NextResponse.json({ success: false, error: 'body.url is required' }, { status: 400 });
    }
    const data = await scrapeEmbedUrl(url);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[API /embed]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Embed extraction failed' },
      { status: 500 }
    );
  }
}
