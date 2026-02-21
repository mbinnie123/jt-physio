import { NextRequest, NextResponse } from "next/server";
import { assembleBlogPost, validateBlogPost } from "@/lib/blog-automation/assembler";
import {
  blogDatabase,
  type BlogDraft,
  type BlogMetadata,
} from "@/lib/blog-automation/db";
import {
  publishToWix,
  type WixPublishResult,
} from "@/lib/blog-automation/wix-publisher";

interface PublishRequestBody {
  draftId: string;
  metadata?: Partial<BlogMetadata>;
  content?: string;
  selectedSourceIds?: string[];
  assembleOnly?: boolean;
  topic?: string;
  location?: string;
  sport?: string;
  refreshMetadata?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = request.headers.get("X-Request-ID");
    if (requestId) {
      console.log(`[API] Publish request - ID: ${requestId}`);
    }

    const body = (await request.json()) as PublishRequestBody;

    if (!body?.draftId) {
      return NextResponse.json(
        { error: "draftId is required" },
        { status: 400 }
      );
    }

    const existingDraft = blogDatabase.getDraft(body.draftId);
    if (!existingDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    const contextUpdates: Partial<BlogDraft> = {};
    const trimmedTopic =
      typeof body.topic === "string" ? body.topic.trim() : undefined;
    const hasLocation = Object.prototype.hasOwnProperty.call(body, "location");
    const hasSport = Object.prototype.hasOwnProperty.call(body, "sport");

    if (trimmedTopic && trimmedTopic !== existingDraft.topic) {
      contextUpdates.topic = trimmedTopic;
    }

    if (hasLocation) {
      const trimmedLocation = (body.location || "").trim();
      contextUpdates.location = trimmedLocation || undefined;
    }

    if (hasSport) {
      const trimmedSport = (body.sport || "").trim();
      contextUpdates.sport = trimmedSport || undefined;
    }

    let draft = existingDraft;
    if (Object.keys(contextUpdates).length > 0) {
      const updatedDraft = blogDatabase.updateDraft(existingDraft.id, contextUpdates);
      if (!updatedDraft) {
        return NextResponse.json(
          { error: "Failed to apply context updates" },
          { status: 500 }
        );
      }
      draft = updatedDraft;
    }

    if (!draft.researchData) {
      return NextResponse.json(
        { error: "Draft missing research data" },
        { status: 400 }
      );
    }

    const sanitizedSections = (draft.sections || []).filter(Boolean);
    if (sanitizedSections.length === 0) {
      return NextResponse.json(
        { error: "Draft must contain at least one section" },
        { status: 400 }
      );
    }

    const mergedMetadata = mergeMetadata(draft.metadata, body.metadata || {});
    const metadataForAssembly = body.refreshMetadata
      ? resetMetadataForContext(mergedMetadata, draft)
      : mergedMetadata;
    const selectedSourceIds = Array.isArray(body.selectedSourceIds)
      ? body.selectedSourceIds.filter((value): value is string =>
          typeof value === "string" && value.trim().length > 0
        )
      : draft.selectedSourceIds || [];

    const assembledPost = assembleBlogPost(
      draft.topic,
      sanitizedSections,
      metadataForAssembly,
      draft.researchData,
      selectedSourceIds,
      {
        location: draft.location,
        sport: draft.sport,
      }
    );

    if (body.content && typeof body.content === "string") {
      assembledPost.content = body.content;
    }

    const validation = validateBlogPost(assembledPost);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Blog post validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    if (body.assembleOnly) {
      const updatedDraft = persistDraftState(draft.id, {
        metadata: assembledPost.metadata,
        selectedSourceIds,
        status: "assembled",
      });

      if (!updatedDraft) {
        return NextResponse.json(
          { error: "Failed to persist assembled draft" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        draft: updatedDraft,
        blogPost: assembledPost,
      });
    }

    const publishResult = await publishToWix(assembledPost, {
      existingPostId: draft.wixPostId,
    });

    const updatedDraft = persistDraftState(draft.id, {
      status: "published",
      metadata: assembledPost.metadata,
      selectedSourceIds,
      wixPostId: publishResult.postId,
      publishedAt: new Date().toISOString(),
    });

    if (!updatedDraft) {
      return NextResponse.json(
        { error: "Failed to update draft after publishing" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publishResult.url,
      postId: publishResult.postId,
      draft: updatedDraft,
      blogPost: assembledPost,
    });
  } catch (error) {
    console.error("Publish API error:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = request.headers.get("X-Request-ID");
    if (requestId) {
      console.log(`[API] Publish GET request - ID: ${requestId}`);
    }

    const url = new URL(request.url);
    const draftId = url.searchParams.get("draftId");

    if (draftId) {
      const draft = blogDatabase.getDraft(draftId);
      if (!draft) {
        return NextResponse.json(
          { error: "Draft not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ draft });
    }

    const published = blogDatabase.getPublishedPosts();
    return NextResponse.json({ drafts: published });
  } catch (error) {
    console.error("Publish GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch publish data" },
      { status: 500 }
    );
  }
}

function mergeMetadata(
  existing: BlogMetadata,
  overrides: Partial<BlogMetadata>
): BlogMetadata {
  const seoKeywords = Array.isArray(overrides.seoKeywords)
    ? overrides.seoKeywords
    : existing.seoKeywords;

  return {
    ...existing,
    ...overrides,
    seoKeywords,
  };
}

function resetMetadataForContext(
  base: BlogMetadata,
  draft: BlogDraft
): BlogMetadata {
  return {
    ...base,
    title: draft.topic,
    slug: "",
    excerpt: "",
    seoTitle: draft.topic,
    seoDescription: "",
    seoKeywords: [],
  };
}

function persistDraftState(
  draftId: string,
  updates: Partial<BlogDraft>
): BlogDraft | null {
  return blogDatabase.updateDraft(draftId, {
    ...updates,
  });
}