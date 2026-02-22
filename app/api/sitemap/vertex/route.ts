import { NextRequest, NextResponse } from 'next/server';
import { addSitemapToVertex, addSitemapToVertexBatch, addUrlToVertex } from '@/lib/vertex-import';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, url, sitemapPath, batchSize, delayMs } = body;

    if (action === 'add-url' && url) {
      // Add single URL
      const result = await addUrlToVertex(url);
      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    if (action === 'add-sitemap') {
      // Add all sitemap URLs
      const result = await addSitemapToVertex(sitemapPath);
      return NextResponse.json({
        success: true,
        summary: {
          total: result.total,
          successful: result.successful,
          failed: result.failed,
        },
        results: result.results,
      });
    }

    if (action === 'add-sitemap-batch') {
      // Batch import with rate limiting
      const result = await addSitemapToVertexBatch(
        sitemapPath,
        batchSize || 5,
        delayMs || 500
      );
      return NextResponse.json({
        success: true,
        summary: {
          total: result.total,
          successful: result.successful,
          failed: result.failed,
        },
        results: result.results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: add-url, add-sitemap, or add-sitemap-batch' },
      { status: 400 }
    );
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

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      endpoints: {
        'POST add-url': {
          description: 'Add a single URL to Vertex',
          body: { action: 'add-url', url: 'https://example.com' },
        },
        'POST add-sitemap': {
          description: 'Import all URLs from sitemap sequentially',
          body: { action: 'add-sitemap', sitemapPath: 'shoulder-urls-sitemap.xml' },
        },
        'POST add-sitemap-batch': {
          description: 'Import all URLs from sitemap with batching and rate limiting',
          body: {
            action: 'add-sitemap-batch',
            sitemapPath: 'shoulder-urls-sitemap.xml',
            batchSize: 5,
            delayMs: 500,
          },
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
