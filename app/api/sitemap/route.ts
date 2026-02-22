import { NextRequest, NextResponse } from 'next/server';
import { getSitemapUrls, getSitemapUrlStrings } from '@/lib/sitemap';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'objects'; // 'objects' or 'strings'
    const sitemapPath = searchParams.get('sitemap') || 'shoulder-urls-sitemap.xml';

    let data;
    if (format === 'strings') {
      data = await getSitemapUrlStrings(sitemapPath);
    } else {
      data = await getSitemapUrls(sitemapPath);
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
