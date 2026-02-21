import { NextRequest, NextResponse } from "next/server";
import { writeSection, generateOutline } from "@/lib/blog-automation/writer";
import { blogDatabase } from "@/lib/blog-automation/db";

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
      // If content is provided directly, use it
      section = {
        title: sectionTitle,
        content,
        wordCount: content.split(/\s+/).length,
      };
    } else {
      // Otherwise, generate the content
      section = await writeSection(
        draft.topic,
        sectionTitle,
        draft.researchData,
        index + 1,
        {
          tone,
          targetAudience,
          wordCountPerSection: targetWords,
        }
      );
    }

    // Update draft with new section
    const existingSections = draft.sections || [];
    const updatedSections = [...existingSections];
    updatedSections[index] = section;

    const updatedDraft = blogDatabase.updateDraft(draft.id, {
      sections: updatedSections,
    });

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

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId is required" },
        { status: 400 }
      );
    }

    const draft = blogDatabase.getDraft(draftId);
    if (!draft) {
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
      const outline = await generateOutline(draft.topic, draft.researchData);
      return NextResponse.json({ outline });
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
