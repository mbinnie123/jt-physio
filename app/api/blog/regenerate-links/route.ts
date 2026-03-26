import { NextRequest, NextResponse } from "next/server";
import { blogDatabase } from "@/lib/blog-automation/db";
import type { ResearchData } from "@/lib/blog-automation/research";
import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }
  return new OpenAI({ apiKey });
}

interface RegenerateLinksBody {
  draftId: string;
  sectionIndex: number;
  sectionTitle: string;
  sectionContent: string; // HTML content
  externalLinksPerSection?: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RegenerateLinksBody;

    if (!body?.draftId || body.sectionIndex === undefined || !body.sectionContent) {
      return NextResponse.json(
        { error: "draftId, sectionIndex, and sectionContent are required" },
        { status: 400 }
      );
    }

    const draft = blogDatabase.getDraft(body.draftId);
    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    if (!draft.researchData) {
      return NextResponse.json(
        { error: "Draft must have research data" },
        { status: 400 }
      );
    }

    // Convert HTML to markdown-like format for link injection
    // Strip HTML tags but preserve heading structure and paragraphs
    let contentForLinking = body.sectionContent
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, (match, content) => {
        const text = content.replace(/<[^>]*>/g, "");
        return `\n${text}\n`;
      })
      .replace(/<p[^>]*>(.*?)<\/p>/gi, (match, content) => {
        const text = content.replace(/<[^>]*>/g, "");
        return `${text}\n`;
      })
      .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

    // Remove existing external links but keep anchor text
    contentForLinking = contentForLinking
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1"); // Convert [text](url) back to text

    // Filter research data by selected sources
    const selectedSources = draft.researchData.sources.filter((source: any) => {
      if (source.url) {
        return draft.selectedSourceIds.includes(source.url);
      }
      return false;
    });

    if (selectedSources.length === 0) {
      return NextResponse.json(
        { error: "No selected sources available for linking" },
        { status: 400 }
      );
    }

    // Prepare research data with only selected sources
    const filteredResearchData: ResearchData = {
      ...draft.researchData,
      sources: selectedSources,
    };

    // Use the cycling source order for this section
    console.log(`[Regenerate Links] Section ${body.sectionIndex}: Started`);
    console.log(`[Regenerate Links] Selected sources: ${draft.selectedSourceIds.length}`);
    console.log(`[Regenerate Links] Current sourceUsageIndex: ${draft.sourceUsageIndex || 0}`);

    const externalLinksPerSection = body.externalLinksPerSection || 3;
    const cycledSourceIds = calculateSourceOrder(
      draft.selectedSourceIds,
      draft.sourceUsageIndex || 0,
      externalLinksPerSection
    );

    console.log(`[Regenerate Links] Cycled source IDs: [${cycledSourceIds.slice(0, 3).join(", ")}]`);
    console.log(`[Regenerate Links] Content to link length: ${contentForLinking.length}`);

    // Re-inject external links using addContextualLinks from writer
    const contentWithNewLinks = await addContextualLinksForRegenerateEndpoint(
      contentForLinking,
      filteredResearchData,
      cycledSourceIds,
      externalLinksPerSection,
      draft.topic,
      body.sectionTitle
    );

    const linkMatches = contentWithNewLinks.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g) || [];
    console.log(`[Regenerate Links] Generated ${linkMatches.length} links`);
    if (linkMatches.length > 0) {
      console.log(`[Regenerate Links] Sample links: ${linkMatches.slice(0, 2).join(" | ")}`);
    }

    // Update source usage index for next section
    const numSelectedSources = draft.selectedSourceIds.length;
    let newSourceIndex = (draft.sourceUsageIndex || 0) + externalLinksPerSection;
    if (numSelectedSources > 0) {
      newSourceIndex = newSourceIndex % numSelectedSources;
    }

    console.log(`[Regenerate Links] Next sourceUsageIndex: ${newSourceIndex}`);

    // Update draft's source usage index
    blogDatabase.updateDraft(draft.id, {
      sourceUsageIndex: newSourceIndex,
    });

    return NextResponse.json({
      success: true,
      contentWithNewLinks,
      newSourceIndex,
    });
  } catch (error) {
    console.error("Regenerate links error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to regenerate links: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Calculate the order of sources to use with round-robin cycling
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

  for (let i = 0; i < numLinksNeeded; i++) {
    const index = (startIndex + i) % numSources;
    result.push(selectedSourceIds[index]);
  }

  return result;
}

/**
 * Re-inject external links into content
 * This is a simplified version of addContextualLinks adapted for the regenerate endpoint
 */
async function addContextualLinksForRegenerateEndpoint(
  content: string,
  researchData: ResearchData,
  selectedSourceIds: string[],
  maxExternalLinks?: number,
  topic?: string,
  sectionTitle?: string
): Promise<string> {
  if (!researchData.sources || researchData.sources.length === 0) {
    console.log("[Links] No sources available to link");
    return content;
  }

  // Build a map of URL -> Source
  const sourceMap = new Map<string, any>();
  researchData.sources.forEach((source: any) => {
    if (source.url) {
      sourceMap.set(source.url, source);
    }
  });

  // Select sources in cycling order
  const selectedSources: any[] = [];
  for (const id of selectedSourceIds) {
    const source = sourceMap.get(id);
    if (source) {
      selectedSources.push(source);
    }
  }

  const sourcesToLink = maxExternalLinks 
    ? selectedSources.slice(0, maxExternalLinks)
    : selectedSources;

  console.log(`[Links] Regenerating ${sourcesToLink.length} external links (order-preserving)`);

  if (sourcesToLink.length === 0) {
    console.log("[Links] No sources to link");
    return content;
  }

  try {
    const client = getOpenAIClient();

    const sourcesDescription = sourcesToLink
      .map((s, i) => `${i + 1}. Title: "${s.title}" — URL: ${s.url}`)
      .join("\n");

    const prompt = `You are a health and physiotherapy content editor. Your task is to regenerate links so they read as naturally written copy.

  Blog topic: ${topic || "N/A"}
  Section title: ${sectionTitle || "N/A"}

**Content:**
${content.substring(0, 3000)}

**Sources to link (insert ALL of these, using different anchor phrases from what might have been used before):**
${sourcesDescription}

**Instructions:**
1. For each source, place one citation where that claim/concept is discussed in the sentence.
2. Use natural anchor text (2-5 words) describing the concept itself, not the publication/source name.
3. You may lightly rewrite nearby words to make the anchor read naturally.
4. Avoid awkward forced insertions, detached fragments, or unnatural phrasing.
5. Do NOT place links in headings or list labels.
6. Do NOT add more than one link per source.
7. Keep tone/meaning/structure of the section; do not rewrite unrelated parts.
8. Return the FULL modified content with markdown links: [anchor](URL)
9. Do NOT wrap your response in markdown code fences or backticks
10. Do NOT add any commentary — return ONLY the modified content
11. Use British English spelling

The links should feel organic and naturally distributed throughout the content.`;

    const response = await client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    let result = response.choices[0]?.message?.content?.trim() || content;

    console.log(`[Links] AI response length: ${result.length}, original length: ${content.length}`);

    // Strip code fences if AI wrapped the response
    const fenceMatch = result.match(/^```[a-zA-Z]*\r?\n([\s\S]*?)\n?```\s*$/);
    if (fenceMatch) {
      console.log("[Links] Found code fences, extracting content");
      result = fenceMatch[1].trim();
    }
    result = result.replace(/^```[a-zA-Z]*\s*\n?/, "").replace(/\n?```\s*$/, "").trim();

    // Verify AI didn't completely mangle the content
    if (result.length < content.length * 0.5) {
      console.warn("[Links] AI output too short (< 50% of original), using original content");
      return content;
    }

    const linkedCount = sourcesToLink.filter(s => result.includes(s.url!)).length;
    console.log(`[Links] ✓ Regenerated ${linkedCount}/${sourcesToLink.length} links`);
    console.log(`[Links] Sample output (first 500 chars): ${result.substring(0, 500)}`);

    if (linkedCount === 0) {
      console.warn("[Links] No links inserted after regeneration; returning original content");
      return content;
    }

    return result;
  } catch (error) {
    console.error("[Links] Regeneration failed:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Links] Error details:", errorMsg);
    return content; // Return original if regeneration fails
  }
}
