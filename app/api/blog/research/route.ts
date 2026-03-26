import { NextRequest, NextResponse } from "next/server";
import {
  performComprehensiveResearch,
  type ResearchData,
} from "@/lib/blog-automation/research";
import { generateOutline } from "@/lib/blog-automation/writer";
import { blogDatabase } from "@/lib/blog-automation/db";

function buildSourceId(source: any, index: number): string {
  if (source?.url && typeof source.url === "string") {
    return source.url;
  }

  const title = typeof source?.title === "string" ? source.title.trim() : "source";
  const provider = typeof source?.source === "string" ? source.source.trim() : "unknown";
  return `${title}::${provider}::${index}`;
}

function buildLegacySourceId(source: any, index: number): string {
  if (source?.url && typeof source.url === "string") {
    return source.url;
  }

  const title = typeof source?.title === "string" ? source.title : "source";
  return `${title}-${index}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Log request ID for tracking
    const requestId = request.headers.get("X-Request-ID");
    if (requestId) {
      console.log(`[API] Research request - ID: ${requestId}`);
    }

    const {
      topic,
      location,
      sport,
      draftId,
      numSections = 5,
      maxResults,
      researchMore = false,
      includeChecklist = true,
      includeFaq = true,
      includeInternalCta = true,
      includeOverview = true,
      includeAuthorTakeaway = false,
      authorTakeawayText = "",
    } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Create or update draft
    let draft;
    if (draftId) {
      draft = blogDatabase.getDraft(draftId);
      if (!draft) {
        return NextResponse.json(
          { error: "Draft not found" },
          { status: 404 }
        );
      }
    } else {
      draft = blogDatabase.createDraft(topic);
      // Add location, sport and options to draft
      const draftUpdates: any = {};
      if (location) {
        draftUpdates.location = location;
      }
      if (sport) {
        draftUpdates.sport = sport;
      }
      draftUpdates.includeChecklist = includeChecklist;
      draftUpdates.includeFaq = includeFaq;
      draftUpdates.includeInternalCta = includeInternalCta;
      draftUpdates.includeOverview = includeOverview;
      draftUpdates.includeAuthorTakeaway = Boolean(includeAuthorTakeaway);
      draftUpdates.authorTakeawayText =
        typeof authorTakeawayText === "string" ? authorTakeawayText : "";
      
      // Update draft with these fields
      const updatedDraft = blogDatabase.updateDraft(draft.id, draftUpdates);
      if (!updatedDraft) {
        return NextResponse.json(
          { error: "Failed to update draft" },
          { status: 500 }
        );
      }
      draft = updatedDraft;
    }

    // Conduct research
    const parsedMaxResults =
      typeof maxResults === "number" && Number.isFinite(maxResults)
        ? Math.min(Math.max(Math.floor(maxResults), 1), 100)
        : undefined;

    const newResearchData = await performComprehensiveResearch(
      topic,
      parsedMaxResults
    );
    
    // If researchMore is true, combine with existing sources
    let researchData = newResearchData;
    if (researchMore && draft.researchData) {
      // Combine sources, avoiding duplicates
      const existingUrls = new Set(
        draft.researchData.sources.map((s: any) => s.url || s.title)
      );
      const newSources = newResearchData.sources.filter((s: any) => {
        const identifier = s.url || s.title;
        return !existingUrls.has(identifier);
      });
      
      researchData = {
        ...newResearchData,
        sources: [...(draft.researchData.sources || []), ...newSources],
        keywords: Array.from(
          new Set([...draft.researchData.keywords, ...newResearchData.keywords])
        ),
      };
    }

    // Generate outline only if not researching more
    let outline: string[] = [];
    if (!researchMore) {
      outline = await generateOutline(topic, researchData, numSections);
    }

    // Update draft with research data.
    // Keep existing source selections for this draft whenever possible.
    const allCurrentSourceIds = researchData?.sources?.length > 0
      ? researchData.sources.map((source: any, index: number) =>
          buildSourceId(source, index)
        )
      : [];

    let selectedSourceIds: string[] = [];
    const existingSelections = Array.isArray(draft.selectedSourceIds)
      ? draft.selectedSourceIds
      : [];

    if (existingSelections.length > 0) {
      const availableIdSet = new Set(allCurrentSourceIds);
      const legacyIdMap = new Map<string, string>();
      researchData.sources.forEach((source: any, index: number) => {
        legacyIdMap.set(buildLegacySourceId(source, index), buildSourceId(source, index));
      });

      selectedSourceIds = existingSelections
        .map((id) => {
          if (availableIdSet.has(id)) {
            return id;
          }
          return legacyIdMap.get(id) || null;
        })
        .filter((id): id is string => Boolean(id));
    }

    // For brand new drafts with no prior selection, default to selecting all.
    if (selectedSourceIds.length === 0 && !draftId) {
      selectedSourceIds = allCurrentSourceIds;
    }

    const finalDraft = blogDatabase.updateDraft(draft.id, {
      status: researchMore ? draft.status : "writing",
      researchData,
      selectedSourceIds,
    });

    if (!finalDraft) {
      return NextResponse.json(
        { error: "Failed to update draft with research data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: finalDraft,
      research: researchData,
      outline,
    });
  } catch (error) {
    console.error("Research API error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMsg, error);
    return NextResponse.json(
      {
        error: errorMsg || "Research failed",
        debug: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Log request ID for tracking
    const requestId = request.headers.get("X-Request-ID");
    if (requestId) {
      console.log(`[API] Research GET request - ID: ${requestId}`);
    }

    const url = new URL(request.url);
    const draftId = url.searchParams.get("draftId");

    let drafts;
    if (draftId) {
      const draft = blogDatabase.getDraft(draftId);
      drafts = draft ? [draft] : [];
    } else {
      drafts = blogDatabase.getInProgressDrafts();
    }

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Research GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch research data" },
      { status: 500 }
    );
  }
}
