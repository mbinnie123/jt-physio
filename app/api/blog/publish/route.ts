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
import { writeMetadata } from "@/lib/blog-automation/writer";
import { generateBlogImage } from "@/lib/blog-automation/image-generator";

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
  preserveStatus?: boolean;
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
      console.error(`Draft not found: draftId=${body.draftId}, available drafts=${blogDatabase.getAllDrafts().map((d: any) => d.id).join(",")}`);
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
    
    // Only require sections if we're actually assembling/publishing, not just refreshing metadata
    if (!body.refreshMetadata && sanitizedSections.length === 0) {
      return NextResponse.json(
        { error: "Draft must contain at least one section" },
        { status: 400 }
      );
    }

    let metadataForAssembly = mergeMetadata(draft.metadata, body.metadata || {});
    
    // If refreshMetadata is requested, regenerate metadata from research only
    if (body.refreshMetadata && draft.researchData) {
      try {
        // If we have sections, use them for content preview; otherwise use research data
        let contentPreview = "";
        if (sanitizedSections.length > 0) {
          contentPreview = sanitizedSections
            .slice(0, 2)
            .map((s) => s.content)
            .join("\n\n");
        } else {
          // Fall back to research sources if no sections yet
          contentPreview = draft.researchData.sources
            .slice(0, 3)
            .map((s: any) => s.content || s.title || "")
            .join("\n\n");
        }
        
        const newMetadata = await writeMetadata(
          draft.topic,
          contentPreview,
          draft.researchData
        );
        
        if (newMetadata && typeof newMetadata === "object") {
          metadataForAssembly = {
            ...metadataForAssembly,
            title: newMetadata.title || metadataForAssembly.title,
            slug: newMetadata.slug || metadataForAssembly.slug,
            excerpt: newMetadata.description || metadataForAssembly.excerpt,
            seoTitle: newMetadata.title || metadataForAssembly.seoTitle,
            seoDescription: newMetadata.description || metadataForAssembly.seoDescription,
            seoKeywords: Array.isArray(newMetadata.keywords)
              ? newMetadata.keywords
              : metadataForAssembly.seoKeywords,
          };
        }
      } catch (err) {
        console.error("Error regenerating metadata:", err);
        // Fall back to enriched metadata from assembly
      }
    }
    
    const selectedSourceIds = Array.isArray(body.selectedSourceIds)
      ? body.selectedSourceIds.filter((value): value is string =>
          typeof value === "string" && value.trim().length > 0
        )
      : draft.selectedSourceIds || [];

    // If refreshing metadata without sections, just update and return
    if (body.refreshMetadata && sanitizedSections.length === 0) {
      const updatedDraft = persistDraftState(draft.id, {
        metadata: metadataForAssembly,
        selectedSourceIds,
        status: body.preserveStatus ? draft.status : draft.status,
      });

      if (!updatedDraft) {
        return NextResponse.json(
          { error: "Failed to update draft metadata" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Metadata refreshed successfully",
        draft: updatedDraft,
      });
    }

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

    // Generate featured image if not already present
    if (!assembledPost.featuredImageUrl) {
      try {
        console.log("[API] Generating featured image for:", draft.topic);
        const keywords = (assembledPost.metadata?.seoKeywords || [])
          .slice(0, 5)
          .filter((k) => typeof k === "string" && k.length > 0);
        
        const imageUrl = await generateBlogImage(draft.topic, keywords as string[]);
        
        if (imageUrl) {
          assembledPost.featuredImageUrl = imageUrl;
          console.log("[API] ✓ Featured image generated:", imageUrl);
        } else {
          console.warn("[API] Image generation returned null, continuing without featured image");
        }
      } catch (error) {
        console.error("[API] Error generating featured image:", error);
        // Continue without featured image rather than failing the entire publish
      }
    }

    if (body.assembleOnly) {
      console.log("[API] assembleOnly branch. preserveStatus:", body.preserveStatus);
      const updatedDraft = persistDraftState(draft.id, {
        metadata: assembledPost.metadata,
        selectedSourceIds,
        status: body.preserveStatus ? draft.status : "assembled",
      });

      if (!updatedDraft) {
        return NextResponse.json(
          { error: "Failed to persist assembled draft" },
          { status: 500 }
        );
      }

      console.log("[API] Assembly complete. Updated draft status:", updatedDraft.status);

      return NextResponse.json({
        success: true,
        draft: updatedDraft,
        blogPost: assembledPost,
      });
    }

    if (!assembledPost.featuredImageUrl) {
      return NextResponse.json(
        {
          error:
            "Featured image is required before publishing. Please generate or upload an image and try again.",
        },
        { status: 400 }
      );
    }

    const publishResult = await publishToWix(assembledPost, {
      existingPostId: draft.wixPostId,
    });

    console.log("[API] Publish result:", {
      postId: publishResult.postId,
      action: publishResult.action,
      featuredImageUrl: assembledPost.featuredImageUrl,
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

function persistDraftState(
  draftId: string,
  updates: Partial<BlogDraft>
): BlogDraft | null {
  return blogDatabase.updateDraft(draftId, {
    ...updates,
  });
}