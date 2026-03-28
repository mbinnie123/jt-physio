import "server-only";

import OpenAI from "openai";
import { ResearchData } from "./research";
import { ricosToHtml } from "./writer-utils";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (openai) return openai;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server."
    );
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

export interface BlogSection {
  title: string;
  content: any; // Ricos format object
  contentHtml?: string; // HTML version for reference
  imageUrl?: string; // Optional section header image
  sectionNumber: number;
  wordCount: number;
}

export interface WriterOptions {
  tone?: "professional" | "friendly" | "expert" | "clinical";
  targetAudience?: string;
  wordCountPerSection?: number;
  includeHeaders?: boolean;
  externalLinksPerSection?: number;
  internalLinksPerSection?: number;
  location?: string;
  sport?: string;
}

const defaultOptions: WriterOptions = {
  tone: "professional",
  targetAudience: "physiotherapy patients",
  wordCountPerSection: 300,
  includeHeaders: true,
  externalLinksPerSection: 3,
  internalLinksPerSection: 2,
  location: "",
  sport: "",
};

/**
 * Write a single blog section based on research data
 */
export async function writeSection(
  topic: string,
  sectionTitle: string,
  researchData: ResearchData,
  sectionNumber: number,
  options: WriterOptions = {},
  selectedSourceIds?: string[]
): Promise<BlogSection> {
  const opts = { ...defaultOptions, ...options } as Required<WriterOptions>;

  const prompt = buildWritingPrompt(
    topic,
    sectionTitle,
    researchData,
    opts,
    sectionNumber
  );

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert physiotherapy content writer. Write engaging, informative, and accurate content for a physiotherapy blog. You must follow citation instructions precisely. Use UK English spelling and grammar (e.g., colour, analyse, organised, physiotherapy).",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6, // Slightly lower to encourage following citation format precisely
      max_tokens: 2000, // Higher cap to prevent sections being cut off mid-generation
    });

    let content =
      response.choices[0]?.message?.content ||
      "Failed to generate content";

    console.log(`\n[DEBUG] Generated content length: ${content.length}`);
    console.log(`[DEBUG] First 300 chars: ${content.substring(0, 300)}`);

    // Fix unclosed heading tags before conversion.
    content = fixUnclosedHeadingTags(content);

    // AI now generates citations directly with [text](url) format
    // Check if AI included citations
    const linkMatches = content.match(/\[.*?\]\(https?:\/\/.*?\)/g);
    console.log(`[Links] AI-generated citations found: ${linkMatches ? linkMatches.length : 0}`);
    if (linkMatches) {
      linkMatches.slice(0, 3).forEach(link => console.log(`  - ${link.substring(0, 80)}`));
    }

    // Convert to Wix Ricos (Rich Content) format
    const ricos = convertToRicos(content);

    return {
      title: sectionTitle,
      content: ricos, // Return as Ricos object
      contentHtml: ricosToHtml(ricos), // Safe HTML version for display
      sectionNumber,
      wordCount: content.split(/\s+/).length,
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Failed to write section");
  }
}

/**
 * Generate complete blog outline based on topic and research
 */
export async function generateOutline(
  topic: string,
  researchData: ResearchData,
  numSections: number = 5
): Promise<string[]> {
  const prompt = `Based on the topic "${topic}" and the following research sources, create a detailed blog outline with exactly ${numSections} main sections. Use UK English spelling and grammar.

Topic: ${topic}
Research Sources: ${researchData.sources.map((s) => s.title).join(", ")}

Return ONLY a JSON array of ${numSections} section titles, like this format:
["Introduction to ${topic}", "Key Benefits", "How It Works", "Expert Tips", "Conclusion"]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "[]";
    const outline = normalizeOutline(content, numSections);
    
    return outline;
  } catch (error) {
    console.error("Outline generation error:", error);
    return [];
  }
}

/**
 * Write metadata (SEO description, keywords, etc.)
 */
export async function writeMetadata(
  topic: string,
  content: string,
  researchData: ResearchData
) {
  const prompt = `Create SEO metadata for a blog post about "${topic}". Use UK English spelling and grammar.

First 500 characters of content:
${content.substring(0, 500)}

Research keywords: ${researchData.keywords.join(", ")}

Return a JSON object with:
{
  "title": "SEO optimized title (50-60 chars)",
  "description": "Meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", ...],
  "slug": "url-slug-format"
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.error("Metadata error:", error);
    return {};
  }
}

function buildWritingPrompt(
  topic: string,
  sectionTitle: string,
  researchData: ResearchData,
  options: Required<WriterOptions>,
  sectionNumber: number = 1
): string {
  const sources = researchData.sources
    .filter(s => s && (s.title || s.content))
    .map((s, index) => {
      // Ensure content is a string, fallback to excerpt or bodyContent if needed
      let contentText = '';
      if (typeof s.content === 'string') {
        contentText = s.content;
      } else if (typeof s.excerpt === 'string') {
        contentText = s.excerpt;
      } else if (typeof s.bodyContent === 'string') {
        contentText = s.bodyContent;
      }
      const snippet = contentText.substring(0, 120);
      return `${index + 1}. "${s.title || "Source"}" (${s.url || "no url"}): ${snippet}${snippet ? "..." : ""}`;
    })
    .join("\n");

  const keywordsList = researchData.keywords && researchData.keywords.length > 0
    ? researchData.keywords.join(", ")
    : topic;

  const locationContext = options.location?.trim()
    ? `Primary location context: ${options.location.trim()}`
    : "Primary location context: none specified";
  const sportContext = options.sport?.trim()
    ? `Primary sport context: ${options.sport.trim()}`
    : "Primary sport context: general audience";
  const contextInstructions = [
    options.location?.trim()
      ? `- Use the location context naturally where relevant (e.g., local references, service accessibility, practical relevance for ${options.location.trim()}).`
      : "",
    options.sport?.trim()
      ? `- Tailor practical examples and rehab advice to ${options.sport.trim()} when appropriate.`
      : "",
    "- Keep recommendations specific, actionable, and clinically sensible.",
  ]
    .filter(Boolean)
    .join("\n");

  const sectionStructureInstructions = sectionNumber > 1 
    ? `
IMPORTANT - SECTION PLACEMENT:
This is section ${sectionNumber} of a multi-section blog post. Do NOT include a general introduction or overview paragraph that repeats the basic topic explanation. The first section already covered that.

Instead, jump directly into the specific content for this section. If the section title implies action steps or detailed guidance, start with that immediately. For example:
- If the section is about "Immediate Post-Injury Actions", start directly with those actions
- If the section is about "Recovery Exercises", begin with the exercise instructions
- Do not write an introductory paragraph like "Understanding [topic]" or "An important aspect of [topic]"

Focus on delivering concrete, actionable content specific to this section's topic.`
    : "";

  return `Write a ${options.wordCountPerSection}-word blog section titled "${sectionTitle}" for a post about "${topic}".

Tone: ${options.tone}
Target audience: ${options.targetAudience}
${locationContext}
${sportContext}${sectionStructureInstructions}

IMPORTANT - CITATION REQUIREMENT:
You MUST cite the research sources naturally throughout the content. When you reference information from a source, use this format to create a citation:
[anchor_text](source_url)

The anchor text MUST be natural and contextual - link the actual concept/keyword, not the source name.

GOOD EXAMPLES OF NATURAL ANCHOR TEXT:
✅ According to [shoulder exercises](url), stretches should be done slowly to avoid setbacks.
✅ Research on [physiotherapy outcomes](url) shows that consistent treatment improves recovery.
✅ The [Schroth method](url) has been proven effective in clinical studies.
✅ Studies recommend [gentle movement progression](url) when starting rehabilitation.

BAD EXAMPLES (DO NOT USE):
❌ According to [NHS approved shoulder exercises](url)
❌ According to [NHS](url) shoulder exercises
❌ Research from [Mayo Clinic research on physiotherapy](url)
❌ Data from [Cleveland Clinic experts](url)

Guidelines for creating effective anchor text:
- Link the actual concept, keyword, or topic - NOT the source/publication name
- Anchor text should be 2-5 words describing the actual subject matter
- Examples: "shoulder exercises", "scoliosis stretches", "recovery techniques", "physiotherapy protocols"
- Keep it simple and topical
- Avoid including source names like "NHS", "Mayo Clinic", "Research from", etc.
- Each citation should reference a different source when possible
- Always use the exact source URLs provided below

Available sources to cite from:
${sources || "No specific sources available"}

Keywords to incorporate: ${keywordsList}

Context tailoring requirements:
${contextInstructions}

${options.includeHeaders ? `Include relevant subheadings for better readability.
- Use [H3]...[/H3] for the first in-section heading if a heading is needed.
- Use [H4]...[/H4] for subordinate subheadings beneath it.

Example:
[H3]Understanding ACL Injuries[/H3]
Opening paragraph...

[H4]Symptoms of ACL Injuries[/H4]
Content for this subsection...` : ""}

${options.includeHeaders ? `CRITICAL HEADING RULES:
- A heading must be on its own line.
- Immediately close every heading marker, exactly like [H3]Heading[/H3] or [H4]Heading[/H4].
- Never write body copy on the same line as a heading marker.
- Never start a paragraph with a bare [H4] tag.
- Do not use **bold** by itself as a heading when a subheading is intended.` : ""}

CRITICAL ANCHOR TEXT RULES:
- Keep every linked anchor under 5 words.
- Make anchors descriptive, natural, and contextual.
- Prefer partial-match or topic-match anchors, not source names.
- Do not use generic anchors like "click here", "read more", "learn more", or "this page".
- Do not use long clause-length anchors or entire sentence fragments.
- Do not use source-led anchors like "according to Sports Medicine Australia" or "the Cromwell Hospital guide".
- Good anchor examples: "ACL injury symptoms", "knee instability", "early physiotherapy", "football rehab".

IMPORTANT SEO BOLDING RULES:
Use **bold** (double asterisks) strategically for SEO and readability. Bold text signals importance to both readers and search engines. Use <strong> semantics — write **word or phrase** and it will be rendered as <strong> in HTML. Target 5–10% of text — enough to highlight key points without looking spammy.

What to bold:
1. TARGET KEYWORDS: Bold the primary topic keyword or phrase once in the introduction and 1–2 natural placements in the body (e.g., **anterior cruciate ligament** or **physiotherapy rehabilitation**).
2. KEY PHRASES: Bold important clinical concepts, direct answers to questions, or thematic phrases readers would scan for (e.g., **reduce inflammation**, **return-to-play protocol**, **load management**).
3. IN-PARAGRAPH LEAD PHRASES: When a paragraph introduces a specific concept or step, bold the key term at the start to aid skimming (e.g., **PRICE method** — Protection, Rest, Ice...).
4. SUMMARY STATEMENTS: Bold the key clinical takeaway at the end of a section or important paragraph (e.g., "...making **consistent rehabilitation the single most important factor in long-term recovery**.")

Bolding rules:
- Limit bold to 5–10% of total text — do not bold every keyword or sentence.
- Never bold whole sentences or full paragraphs.
- Never use bold as a substitute for a subheading — use [H3]/[H4] for that.
- Only bold where it makes natural grammatical and contextual sense; do not force keywords.
- Prioritise readability for the human reader — SEO benefit is secondary.
- Avoid bolding the same phrase repeatedly; bold it once or twice at most.

Write engaging, informative content that helps the reader understand and apply the information. Use UK English spelling and grammar throughout.`;
}

function normalizeOutline(content: string, numSections: number): string[] {
  let outline: string[] = [];

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        outline = parsed.map((item) =>
          typeof item === "string" ? item.trim() : String(item)
        );
      }
    }
  } catch (error) {
    console.warn("Outline JSON parse failed, falling back to text parsing:", error);
  }

  if (outline.length === 0) {
    outline = content
      .split(/\r?\n+/)
      .map((line) => line.replace(/^[\s\-\d\.)]+/, "").trim())
      .filter((line) => line.length > 0 && line.length < 180);
  }

  if (outline.length === 0) {
    outline = Array.from({ length: numSections }, (_, i) => `Section ${i + 1}`);
  }

  if (outline.length < numSections) {
    const missing = numSections - outline.length;
    for (let i = 0; i < missing; i++) {
      outline.push(`Section ${outline.length + 1}`);
    }
  }

  return outline.slice(0, numSections);
}

/**
 * Fix unclosed heading tags by ensuring every [H1]-[H6] marker has a closing tag.
 */
function fixUnclosedHeadingTags(content: string): string {
  let result = content;

  for (let level = 1; level <= 6; level++) {
    const openTagRegex = new RegExp(`\\[H${level}\\]`, "g");
    const closeTagRegex = new RegExp(`\\[\\/H${level}\\]`, "g");

    const openCount = (result.match(openTagRegex) || []).length;
    const closeCount = (result.match(closeTagRegex) || []).length;

    if (openCount <= closeCount) {
      continue;
    }

    const openPositions: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = openTagRegex.exec(result)) !== null) {
      openPositions.push(match.index);
    }

    const closePositions: number[] = [];
    while ((match = closeTagRegex.exec(result)) !== null) {
      closePositions.push(match.index);
    }

    for (let index = openPositions.length - 1; index >= 0; index--) {
      const openPos = openPositions[index];
      const hasClosing = closePositions.some((closePos) => closePos > openPos);
      if (hasClosing) {
        continue;
      }

      const markerLength = `[H${level}]`.length;
      const nextNewline = result.indexOf("\n", openPos + markerLength);
      const nextDoubleNewline = result.indexOf("\n\n", openPos + markerLength);
      const insertPos =
        nextDoubleNewline !== -1
          ? nextDoubleNewline
          : nextNewline !== -1
            ? nextNewline
            : result.length;

      result = result.slice(0, insertPos) + `[/H${level}]` + result.slice(insertPos);
      break;
    }
  }

  return result;
}
/**
 * Add contextual links to content based on selected sources
 * Matches key phrases from source titles to content and creates markdown links
 */
function addContextualLinks(
  content: string,
  researchData: ResearchData,
  selectedSourceIds: string[]
): string {
  if (!researchData.sources || researchData.sources.length === 0) {
    console.log("[Links] No sources available to link");
    return content;
  }

  // Filter to only selected sources (use URL as stable identifier)
  const selectedSources = researchData.sources.filter((source: any) => {
    // Always use URL if available since it's the most stable identifier
    if (source.url) {
      return selectedSourceIds.includes(source.url);
    }
    // Fallback to title-based ID if no URL (shouldn't happen with Serpapi)
    return false;
  });

  console.log(`[Links] Linking to ${selectedSources.length} selected sources`);

  if (selectedSources.length === 0) {
    console.log("[Links] No matching sources found for IDs:", selectedSourceIds);
    return content;
  }

  // Track already linked text to avoid duplicate links
  const linkedPhrases = new Set<string>();

  // Common medical/physiotherapy terms to use as fallback
  const commonMedicalTerms = [
    "physiotherapy", "physical therapy", "treatment", "rehabilitation", 
    "exercises", "pain", "recovery", "therapy", "healthcare", "medical",
    "condition", "management", "patient", "care", "diagnosis", "symptoms",
    "muscles", "nerves", "inflammation", "injury", "healing"
  ];

  // Process each selected source
  selectedSources.forEach((source: any, sourceIdx: number) => {
    if (!source.url || !source.title) return;

    console.log(`\n[Links] Processing source ${sourceIdx + 1}/${selectedSources.length}: "${source.title.substring(0, 50)}"`);

    // Extract link text candidates from source title
    // Try multiple strategies to find linkable text in the content
    const candidates: string[] = [];

    // Strategy 1: Use parts of the title split by delimiters
    const titleParts = source.title
      .split(/:|–|-/)
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 3);
    candidates.push(...titleParts);

    // Strategy 2: Extract domain name from URL (e.g., "mayo clinic" from mayoclinic.com)
    try {
      const urlDomain = new URL(source.url).hostname
        .replace(/^www\./, "")
        .split(".")[0];
      if (urlDomain && urlDomain.length > 2) {
        candidates.push(urlDomain);
      }
    } catch (e) {
      // Invalid URL, skip domain extraction
    }

    // Strategy 3: Use the first 3-4 words from the title if it contains key phrases
    const firstWords = source.title
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");
    if (firstWords.length > 5) {
      candidates.push(firstWords);
    }

    // Strategy 4: Add common medical terms as fallback candidates
    candidates.push(...commonMedicalTerms);

    console.log(`[Links]   Candidates to try: ${candidates.slice(0, 8).join(", ")}`);

    // Try to find and link each candidate (first match wins)
    for (const phrase of candidates) {
      if (linkedPhrases.has(phrase) || !phrase) continue;

      // Escape regex chars and create case-insensitive matcher
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(`\\b${escapedPhrase}\\b(?!\\]\\()`, "i");

      if (!matcher.test(content)) {
        continue; // This phrase not found, try next candidate
      }

      console.log(`[Links]   ✓ Found match for phrase: "${phrase}"`);

      // Split content so we only link in body copy (exclude heading markers)
      const segments = content.split(/(\[H[1-6]\].*?\[\/H[1-6]\])/gis);
      let updated = false;

      for (let i = 0; i < segments.length; i++) {
        const isHeadingSegment = /^\[H[1-6]\]/i.test(segments[i]);
        if (isHeadingSegment) continue;

        if (matcher.test(segments[i])) {
          // Replace first occurrence with markdown link
          segments[i] = segments[i].replace(matcher, `[${phrase}](${source.url})`);
          console.log(`[Links]   ✓ Linked "${phrase}" to ${source.url}`);
          updated = true;
          break;
        }
      }

      if (updated) {
        content = segments.join("");
        linkedPhrases.add(phrase);
        break; // Successfully linked this source, move to next source
      }
    }
  });

  return content;
}

/**
 * Convert markdown-style content to Wix Ricos (Rich Content) format
 */
function convertToRicos(content: string): any {
  const nodes: any[] = [];
  
  // Split by heading markers while preserving them
  const parts = content.split(/(\[H[1-6]\].*?\[\/H[1-6]\])/gs);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    // Check if this is a heading
    const headingMatch = part.match(/^\[H([1-6])\]([\s\S]*?)\[\/H\1\]$/i);
    if (headingMatch) {
      const level = Math.min(Math.max(parseInt(headingMatch[1], 10) || 4, 1), 6);
      const headingText = headingMatch[2];
      nodes.push(createHeadingNode(headingText, level));
    } else {
      // Split by double newlines to create paragraphs
      const paragraphs = part.split(/\n\n+/);
      for (const para of paragraphs) {
        if (para.trim()) {
          nodes.push(createParagraphNode(para.trim()));
        }
      }
    }
  }
  
  return { nodes };
}

/**
 * Create a Ricos heading node
 */
function createHeadingNode(text: string, level: number): any {
  return {
    type: "heading",
    level,
    nodes: createTextNodes(text.trim()),
  };
}

/**
 * Create a Ricos paragraph node
 */
function createParagraphNode(text: string): any {
  return {
    type: "paragraph",
    nodes: createTextNodes(text),
  };
}

/**
 * Parse text and create inline nodes for links and text
 */
function createTextNodes(text: string): any[] {
  const nodes: any[] = [];
  const inlineRegex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({
        type: "text",
        data: text.substring(lastIndex, match.index),
      });
    }

    if (match[1]) {
      nodes.push({
        type: "bold",
        nodes: [
          {
            type: "text",
            data: match[1],
          },
        ],
      });
    } else {
      nodes.push({
        type: "link",
        href: match[3],
        target: "_blank",
        rel: "noopener noreferrer",
        nodes: [
          {
            type: "text",
            data: match[2],
          },
        ],
      });
    }

    lastIndex = inlineRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push({
      type: "text",
      data: text.substring(lastIndex),
    });
  }
  
  // If no nodes were created, just add the text as-is
  if (nodes.length === 0) {
    nodes.push({
      type: "text",
      data: text,
    });
  }
  
  return nodes;
}

/**
 * Convert Ricos format to HTML for display
 */

