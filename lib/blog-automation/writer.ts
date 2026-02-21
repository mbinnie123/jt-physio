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
  sectionNumber: number;
  wordCount: number;
}

export interface WriterOptions {
  tone?: "professional" | "friendly" | "expert" | "clinical";
  targetAudience?: string;
  wordCountPerSection?: number;
  includeHeaders?: boolean;
}

const defaultOptions: WriterOptions = {
  tone: "professional",
  targetAudience: "physiotherapy patients",
  wordCountPerSection: 300,
  includeHeaders: true,
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
    opts
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

    // Fix unclosed H3 tags - if [H3] appears without matching [/H3], add it
    content = fixUnclosedH3Tags(content);

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
  options: Required<WriterOptions>
): string {
  const sources = researchData.sources
    .filter(s => s && (s.title || s.content))
    .map((s, index) => {
      const snippet = (s.content || "").substring(0, 120);
      return `${index + 1}. "${s.title || "Source"}" (${s.url || "no url"}): ${snippet}${snippet ? "..." : ""}`;
    })
    .join("\n");

  const keywordsList = researchData.keywords && researchData.keywords.length > 0
    ? researchData.keywords.join(", ")
    : topic;

  return `Write a ${options.wordCountPerSection}-word blog section titled "${sectionTitle}" for a post about "${topic}".

Tone: ${options.tone}
Target audience: ${options.targetAudience}

IMPORTANT - CITATION REQUIREMENT:
You MUST cite the research sources naturally throughout the content. When you reference information from a source, use this format to create a citation:
[citation_text](source_url)

For example: According to [NHS guidance on physiotherapy](https://www.nhs.uk/conditions/physiotherapy/), treatment can help improve recovery.

Available sources to cite from:
${sources || "No specific sources available"}

Guidelines:
- Create 2-4 citations naturally integrated into your writing
- Use meaningful anchor text (e.g., "Mayo Clinic research", "NHS guidelines", "expert recommendations") - NOT generic terms
- The anchor text should be 2-5 words and make sense in context
- Each citation should be attributed to a different source when possible
- Always use the exact source URLs provided above

Keywords to incorporate: ${keywordsList}

${options.includeHeaders ? `Include relevant subheadings for better readability. Format subheadings with [H3] prefix like this:
[H3]Subheading Title[/H3]
Content for this subsection...` : ""}

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
 * Fix unclosed H3 tags by ensuring every [H3] has a matching [/H3]
 */
function fixUnclosedH3Tags(content: string): string {
  // Find all [H3] tags and their corresponding [/H3] closing tags
  const openTagRegex = /\[H3\]/g;
  const closeTagRegex = /\[\/H3\]/g;
  
  const openCount = (content.match(openTagRegex) || []).length;
  const closeCount = (content.match(closeTagRegex) || []).length;
  
  // If we have unclosed tags, try to fix them
  if (openCount > closeCount) {
    // Split by [H3] and process
    let result = content;
    let stack: number[] = [];
    
    // Find positions of opening tags
    let match;
    const openRegex = /\[H3\]/g;
    while ((match = openRegex.exec(content)) !== null) {
      stack.push(match.index);
    }
    
    // Find positions of closing tags
    const closeMatches: number[] = [];
    const closeRegex = /\[\/H3\]/g;
    while ((match = closeRegex.exec(content)) !== null) {
      closeMatches.push(match.index);
    }
    
    // For each unclosed opening tag, find where to insert the closing tag
    if (stack.length > closeMatches.length) {
      // Find the last opening tag without a closing tag
      for (let i = stack.length - 1; i >= 0; i--) {
        const openPos = stack[i];
        // Find if there's a closing tag after this opening tag
        const hasClosing = closeMatches.some(closePos => closePos > openPos);
        
        if (!hasClosing) {
          // This opening tag doesn't have a closing tag
          // Find the next newline or end of string to insert the closing tag
          const nextNewline = content.indexOf('\n', openPos + 4); // +4 for [H3]
          const nextDoubleNewline = content.indexOf('\n\n', openPos + 4);
          
          const insertPos = nextDoubleNewline !== -1 ? nextDoubleNewline : (nextNewline !== -1 ? nextNewline : content.length);
          
          result = result.slice(0, insertPos) + '[/H3]' + result.slice(insertPos);
          break; // Fix one at a time for safety
        }
      }
    }
    
    return result;
  }
  
  return content;
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

      // Split content so we only link in body copy (exclude [H3] headings)
      const segments = content.split(/(\[H3\].*?\[\/H3\])/gis);
      let updated = false;

      for (let i = 0; i < segments.length; i++) {
        const isHeadingSegment = segments[i].startsWith("[H3]");
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
  const parts = content.split(/(\[H3\].*?\[\/H3\])/gs);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    // Check if this is a heading
    if (part.startsWith("[H3]")) {
      const headingText = part.replace(/\[H3\](.*?)\[\/H3\]/s, "$1");
      nodes.push(createHeadingNode(headingText, 3));
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
  const linkRegex = /\[(.*?)\]\((https?:\/\/[^\)]+)\)/g;
  
  let lastIndex = 0;
  let match;
  let linkCount = 0;
  
  while ((match = linkRegex.exec(text)) !== null) {
    linkCount++;
    // Add text before the link
    if (match.index > lastIndex) {
      nodes.push({
        type: "text",
        data: text.substring(lastIndex, match.index),
      });
    }
    
    // Add the link node
    console.log(`[createTextNodes] Found link #${linkCount}: "[${match[1]}](${match[2]})"`);
    nodes.push({
      type: "link",
      href: match[2],
      target: "_blank",
      rel: "noopener noreferrer",
      nodes: [
        {
          type: "text",
          data: match[1],
        },
      ],
    });
    
    lastIndex = linkRegex.lastIndex;
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
    console.log(`[createTextNodes] No markdown links found in text (length: ${text.length})`);
    nodes.push({
      type: "text",
      data: text,
    });
  } else {
    console.log(`[createTextNodes] Total links created: ${linkCount}`);
  }
  
  return nodes;
}

/**
 * Convert Ricos format to HTML for display
 */

