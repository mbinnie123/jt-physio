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

    const {
      draftId,
      sectionTitle,
      sectionIndex,
      sectionNumber,
      content,
      tone = "professional",
      targetAudience = "physiotherapy patients",
      targetWords = 300,
    } = await request.json();

    if (!draftId || !sectionTitle) {
      return NextResponse.json(
        { error: "draftId and sectionTitle are required" },
        { status: 400 }
      );
    }

    // Use sectionIndex if provided, otherwise use sectionNumber
    const index = sectionIndex !== undefined ? sectionIndex : (sectionNumber ? sectionNumber - 1 : 0);

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
      
      // Otherwise, generate the content (returns Ricos format)
      section = await writeSection(
        draft.topic,
        sectionTitle,
        filteredResearch,
        index + 1,
        {
          tone,
          targetAudience,
          wordCountPerSection: targetWords,
        },
        draft.selectedSourceIds // Pass selected source IDs for contextual linking
      );
    }

    // Update draft with new section
    const existingSections = draft.sections || [];
    const updatedSections = [...existingSections];
    updatedSections[index] = section;

    const updatedDraft = blogDatabase.updateDraft(draft.id, {
      sections: updatedSections,
    });

    // Debug: Log what's being returned
    console.log(`[API Response] Section has contentHtml: ${'contentHtml' in section}`);
    if (section.contentHtml) {
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
    console.error("Write section error:", errorMessage, error);
    return NextResponse.json(
      {
        error: errorMessage || "Failed to write section",
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
