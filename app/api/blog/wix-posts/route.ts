import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const WIX_API_BASE = "https://www.wixapis.com";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isAuthorized =
      authHeader &&
      (authHeader === adminPassword || authHeader === `Bearer ${adminPassword}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID;

    if (!apiKey || !siteId) {
      return NextResponse.json(
        { error: "Missing Wix configuration: WIX_API_KEY or WIX_SITE_ID not set" },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const postId = url.searchParams.get("postId");

    const wixHeaders = {
      Authorization: apiKey,
      "wix-site-id": siteId,
    };

    if (action === "details" && postId) {
      const response = await axios.get(`${WIX_API_BASE}/v3/posts/${postId}`, {
        headers: wixHeaders,
        timeout: 15000,
      });

      const post = response.data.post ?? response.data;

      return NextResponse.json({
        post: {
          id: post.id || post._id,
          title: post.title || "Untitled",
          slug: post.slug || null,
          excerpt: post.excerpt || post.description || "",
          publishedDate: post.publishedDate || null,
          featured: Boolean(post.featured),
          seoData: post.seoData || null,
          coverImage: post.coverImage || null,
          url: post.url || null,

          // Return exactly what Wix returned
          richContent: post.richContent ?? null,
          contentText: post.contentText ?? null,
          htmlBody: post.htmlBody ?? null,
          plainContent: post.plainContent ?? null,

          // Helpful flag for the frontend
          contentFormat: post.richContent
            ? "ricos"
            : post.htmlBody
              ? "html"
              : post.contentText
                ? "plainText"
                : "none",
        },
      });
    }

    const response = await axios.get(`${WIX_API_BASE}/v3/posts`, {
      headers: wixHeaders,
      params: { limit: 100 },
      timeout: 15000,
    });

    const rawPosts = response.data.posts || response.data || [];

    const posts = rawPosts.map((post: any) => ({
      id: post.id || post._id,
      title: post.title || "Untitled",
      slug: post.slug || null,
      excerpt: post.excerpt || "",
      publishedDate: post.publishedDate || null,
      featured: Boolean(post.featured),
      seoData: post.seoData || null,
      coverImage: post.coverImage || null,
      hasRichContent: Boolean(post.richContent),
      hasContentText: Boolean(post.contentText),
    }));

    return NextResponse.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch Wix posts",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}