import { NextRequest, NextResponse } from "next/server";
import { listWixPosts, getWixPost } from "@/lib/blog-automation/wix-publisher";

export async function POST(request: NextRequest) {
  try {
    // Verify sync secret
    const syncSecret = request.headers.get("x-sync-secret");
    if (syncSecret !== process.env.BLOG_SYNC_SECRET) {
      return NextResponse.json(
        { error: "Invalid sync secret" },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === "sync") {
      // Fetch latest posts from Wix and sync metadata
      const posts = await listWixPosts(20);

      return NextResponse.json({
        success: true,
        synced: true,
        postsCount: posts.length,
        posts: posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          publishedDate: p.publishedDate,
        })),
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Wix sync error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const syncSecret = request.headers.get("x-sync-secret");
    if (syncSecret !== process.env.BLOG_SYNC_SECRET) {
      return NextResponse.json(
        { error: "Invalid sync secret" },
        { status: 401 }
      );
    }

    const posts = await listWixPosts(20);

    return NextResponse.json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Wix sync GET error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Wix" },
      { status: 500 }
    );
  }
}
