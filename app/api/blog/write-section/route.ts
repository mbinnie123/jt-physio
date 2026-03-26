import { NextRequest, NextResponse } from "next/server";
import { writeSection, generateOutline } from "@/lib/blog-automation/writer";
import { blogDatabase, type BlogDraft } from "@/lib/blog-automation/db";
import { type ResearchData } from "@/lib/blog-automation/research";

export async function POST(request: NextRequest) {
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
      console.log(`[API] Write section request - ID: ${requestId}`);
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error("[API] Failed to parse request JSON:", jsonError instanceof Error ? jsonError.message : String(jsonError));
      return NextResponse.json(
        { 
          error: "Invalid JSON in request body",
          details: jsonError instanceof Error ? jsonError.message : String(jsonError),
        },
        { status: 400 }
      );
    }

    const {
      draftId,
      sectionTitle,
      sectionIndex,
      sectionNumber,
      content,
      tone = "professional",
      targetAudience = "physiotherapy patients",
      targetWords = 300,
      externalLinksPerSection = 3,
      internalLinksPerSection = 2,
      allSectionTitles, // Full outline for de-duplication context
      location,
      sport,
    } = requestBody;

    console.log("[API] Request body parsed successfully:", {
      draftId,
      sectionTitle,
      sectionIndex,
      tone,
      targetAudience,
      targetWords,
      externalLinksPerSection,
      internalLinksPerSection,
      allSectionTitles,
    });

    if (!draftId || !sectionTitle) {
      return NextResponse.json(
        { error: "draftId and sectionTitle are required" },
        { status: 400 }
      );
    }

    // Use sectionIndex if provided, otherwise use sectionNumber.
    // Normalize to a safe integer to avoid accidental fallback to section 1.
    const rawIndex = sectionIndex !== undefined ? sectionIndex : (sectionNumber ? sectionNumber - 1 : 0);
    const parsedIndex = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : 0;
    const index = Math.max(0, Math.floor(parsedIndex));

    console.log("[API] Write-Section DIAGNOSTIC", {
      receivedSectionIndex: sectionIndex,
      receivedSectionNumber: sectionNumber,
      receivedSectionTitle: sectionTitle,
      allSectionTitles: allSectionTitles,
      calculatedIndex: index,
      draftId: draftId,
    });

    const draft = blogDatabase.getDraft(draftId);
    if (!draft) {
      console.error(`[Write-Section] Draft not found. Requested ID: ${draftId}`);
      console.error(`[Write-Section] Available drafts: ${blogDatabase.getAllDrafts().map(d => d.id).join(', ')}`);
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    if (!draft.researchData) {
      return NextResponse.json(
        { error: "Draft must have research data first. Run /research endpoint." },
        { status: 400 }
      );
    }

    // Write the section
    let section;
    if (content) {
      // If content is provided directly, convert it to Ricos format
      // For simplicity, wrap in a paragraph node
      section = {
        title: sectionTitle,
        content: {
          nodes: [
            {
              type: "paragraph",
              nodes: [
                {
                  type: "text",
                  data: content,
                },
              ],
            },
          ],
        },
        wordCount: content.split(/\s+/).length,
      };
    } else {
      // Filter research data by selected sources
      const filteredResearch = filterResearchBySelection(draft, draft.researchData);
      
      // Calculate which sources to use with cycling logic
      const cycledSourceIds = calculateSourceOrder(
        draft.selectedSourceIds,
        draft.sourceUsageIndex || 0,
        externalLinksPerSection
      );
      
      // Build de-duplication context from outline and already-written sections
      const existingSections = draft.sections || [];
      const priorSections: { title: string; contentSummary: string }[] = [];
      for (let i = 0; i < existingSections.length; i++) {
        const s = existingSections[i];
        if (s && i !== index && s.title) {
          // Use contentHtml or extract text from content for a brief summary
          let summary = '';
          if (typeof s.contentHtml === 'string') {
            // Strip HTML tags and truncate to ~200 chars
            summary = s.contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300);
          } else if (s.wordCount) {
            summary = `(${s.wordCount} words already written)`;
          }
          priorSections.push({ title: s.title, contentSummary: summary });
        }
      }

      const outlineContext = (allSectionTitles && Array.isArray(allSectionTitles) && allSectionTitles.length > 1)
        ? { allSectionTitles, priorSections }
        : priorSections.length > 0
          ? { allSectionTitles: priorSections.map(s => s.title), priorSections }
          : undefined;

      // Otherwise, generate the content (returns Ricos format)
      console.log("[API] About to call writeSection with parameters:", {
        topic: draft.topic,
        sectionTitle,
        researchDataLength: filteredResearch.sources?.length || 0,
        sectionNumber: index + 1,
        tone,
        targetAudience,
        wordCountPerSection: targetWords,
        externalLinksPerSection,
        internalLinksPerSection,
        location: location || draft.location || "",
        sport: sport || draft.sport || "",
        cycledSourceIdsLength: (cycledSourceIds || []).length,
      });
      
      section = await writeSection(
        draft.topic,
        sectionTitle,
        filteredResearch,
        index + 1,
        {
          tone,
          targetAudience,
          wordCountPerSection: targetWords,
          externalLinksPerSection,
          internalLinksPerSection,
          location: location || draft.location || "",
          sport: sport || draft.sport || "",
        },
        cycledSourceIds // Pass cycled source IDs for contextual linking
      );
      
      console.log("[API] writeSection completed successfully, result:", {
        title: section.title,
        sectionNumber: section.sectionNumber,
        wordCount: section.wordCount,
        hasContent: !!section.content,
        hasContentHtml: !!section.contentHtml,
      });
    }

    // Update draft with new section AND advance source cycling index
    const existingSections = draft.sections || [];
    const updatedSections = [...existingSections];
    updatedSections[index] = section;

    // Advance source usage index for next section
    const numSelectedSources = draft.selectedSourceIds.length;
    let newSourceIndex = (draft.sourceUsageIndex || 0) + (externalLinksPerSection || 3);
    if (numSelectedSources > 0) {
      newSourceIndex = newSourceIndex % numSelectedSources; // Cycle back to start if needed
    }

    const updatedDraft = blogDatabase.updateDraft(draft.id, {
      sections: updatedSections,
      sourceUsageIndex: newSourceIndex,
    });

    // Debug: Log what's being returned
    console.log(`[API Response] Section has contentHtml: ${'contentHtml' in section}`);
    if (section.contentHtml && typeof section.contentHtml === 'string') {
      const linkCount = (section.contentHtml.match(/<a /g) || []).length;
      console.log(`[API Response] contentHtml length: ${section.contentHtml.length}, links: ${linkCount}`);
      console.log(`[API Response] First 300 chars of contentHtml: ${section.contentHtml.substring(0, 300)}`);
    }

    return NextResponse.json({
      success: true,
      section,
      draft: updatedDraft,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : "";
    console.error("Write section error:", errorMessage);
    console.error("Stack trace:", stackTrace);
    console.error("Full error:", error);
    return NextResponse.json(
      {
        error: errorMessage || "Failed to write section",
        stackTrace: process.env.NODE_ENV === 'development' ? stackTrace : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}

/**
 * Generate outline for a blog post
 */
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
      console.log(`[API] Write section GET request - ID: ${requestId}`);
    }

    const url = new URL(request.url);
    const draftId = url.searchParams.get("draftId");
    const action = url.searchParams.get("action");
    const numSections = parseInt(url.searchParams.get("numSections") || "5");
    const sectionIndex = parseInt(url.searchParams.get("sectionIndex") || "0");

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId is required" },
        { status: 400 }
      );
    }

    const draft = blogDatabase.getDraft(draftId);
    if (!draft) {
      console.error(`[Write-Section-GET] Draft not found. Requested ID: ${draftId}`);
      console.error(`[Write-Section-GET] Available drafts: ${blogDatabase.getAllDrafts().map(d => d.id).join(', ')}`);
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    if (!draft.researchData) {
      return NextResponse.json(
        { error: "Draft must have research data first" },
        { status: 400 }
      );
    }

    if (action === "generateOutline") {
      try {
        const outline = await generateOutline(
          draft.topic,
          filterResearchBySelection(draft, draft.researchData),
          numSections
        );
        
        if (!outline || outline.length === 0) {
          console.error("Generated outline is empty", { topic: draft.topic, sourcesCount: draft.researchData?.sources?.length });
          return NextResponse.json({ 
            error: "Failed to generate outline - empty result from AI",
            outline: [] 
          }, { status: 400 });
        }
        
        return NextResponse.json({ outline });
      } catch (err) {
        console.error("Error generating outline:", err);
        return NextResponse.json(
          { error: `Failed to generate outline: ${err instanceof Error ? err.message : "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    if (action === "regenerateOutlineSection") {
      try {
        const outline = await generateOutline(
          draft.topic,
          filterResearchBySelection(draft, draft.researchData),
          numSections
        );
        
        if (!outline || outline.length === 0) {
          console.error("Generated outline is empty", { topic: draft.topic, sourcesCount: draft.researchData?.sources?.length });
          return NextResponse.json({ 
            error: "Failed to regenerate section",
            outlineItem: null
          }, { status: 400 });
        }
        
        // Return the specific section at the requested index
        const outlineItem = outline[Math.min(sectionIndex, outline.length - 1)];
        
        return NextResponse.json({ outlineItem });
      } catch (err) {
        console.error("Error regenerating outline section:", err);
        return NextResponse.json(
          { error: `Failed to regenerate section: ${err instanceof Error ? err.message : "Unknown error"}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      draft,
      researchData: draft.researchData,
    });
  } catch (error) {
    console.error("Write section GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch section data" },
      { status: 500 }
    );
  }
}

function filterResearchBySelection(
  draft: BlogDraft,
  researchData: ResearchData
): ResearchData {
  const selections = draft.selectedSourceIds || [];
  if (!researchData?.sources || selections.length === 0) {
    return researchData;
  }

  const filteredSources = researchData.sources.filter((source) => {
    if (!source) return false;
    // Always use URL as the primary identifier since it's stable
    if (source.url) {
      return selections.includes(source.url);
    }
    return false;
  });

  if (filteredSources.length === 0) {
    return researchData;
  }

  return {
    ...researchData,
    sources: filteredSources,
  };
}
/**
 * Calculate the order of sources to use for external links with round-robin cycling.
 * Ensures each source is used once before cycling back to reuse sources.
 * 
 * @param selectedSourceIds - Array of source URLs/IDs to cycle through
 * @param startIndex - Current position in the cycle (0-based)
 * @param numLinksNeeded - Number of external links to add in this section
 * @returns Array of source IDs in the order they should be used
 */
function calculateSourceOrder(
  selectedSourceIds: string[],
  startIndex: number,
  numLinksNeeded: number
): string[] {
  if (!selectedSourceIds || selectedSourceIds.length === 0) {
    return [];
  }

  const result: string[] = [];
  const numSources = selectedSourceIds.length;
  
  // Select sources starting from startIndex, cycling through all sources
  for (let i = 0; i < numLinksNeeded; i++) {
    const index = (startIndex + i) % numSources;
    result.push(selectedSourceIds[index]);
  }

  console.log(`[Sources] Cycling from index ${startIndex}: using ${numLinksNeeded} sources from pool of ${numSources}`);
  console.log(`[Sources] Source order: ${result.map((src, i) => `${i}: ${src.substring(0, 40)}`).join(", ")}`);

  return result;
}