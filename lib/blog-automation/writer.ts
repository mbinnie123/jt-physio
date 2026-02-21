import OpenAI from "openai";
import { ResearchData } from "./research";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BlogSection {
  title: string;
  content: string;
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
  options: WriterOptions = {}
): Promise<BlogSection> {
  const opts = { ...defaultOptions, ...options } as Required<WriterOptions>;

  const prompt = buildWritingPrompt(
    topic,
    sectionTitle,
    researchData,
    opts
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert physiotherapy content writer. Write engaging, informative, and accurate content for a physiotherapy blog.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: (opts.wordCountPerSection || 300) * 1.5, // Account for token overhead
    });

    const content =
      response.choices[0]?.message?.content ||
      "Failed to generate content";

    return {
      title: sectionTitle,
      content,
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
  const prompt = `Based on the topic "${topic}" and the following research sources, create a detailed blog outline with exactly ${numSections} main sections.

Topic: ${topic}
Research Sources: ${researchData.sources.map((s) => s.title).join(", ")}

Return ONLY a JSON array of ${numSections} section titles, like this format:
["Introduction to ${topic}", "Key Benefits", "How It Works", "Expert Tips", "Conclusion"]`;

  try {
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
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const outline = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    // Ensure we have the requested number of sections
    while (outline.length < numSections) {
      outline.push(`Section ${outline.length + 1}`);
    }
    
    return outline.slice(0, numSections);
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
  const prompt = `Create SEO metadata for a blog post about "${topic}".

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
    .map((s) => {
      const snippet = (s.content || "").substring(0, 150);
      return `- ${s.title || "Source"}: ${snippet}${snippet ? "..." : ""}`;
    })
    .join("\n");

  const keywordsList = researchData.keywords && researchData.keywords.length > 0
    ? researchData.keywords.join(", ")
    : topic;

  return `Write a ${options.wordCountPerSection}-word blog section titled "${sectionTitle}" for a post about "${topic}".

Tone: ${options.tone}
Target audience: ${options.targetAudience}

Research sources to reference:
${sources || "No specific sources available"}

Keywords to incorporate: ${keywordsList}

${options.includeHeaders ? "Include relevant subheaders (h3 tags) for better readability." : ""}

Write engaging, informative content that helps the reader understand and apply the information.`;
}
