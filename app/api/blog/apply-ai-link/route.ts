import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface ApplyAiLinkBody {
  content?: string;
  anchorText?: string;
  linkUrl?: string;
  oldLinkUrl?: string;
  oldAnchorText?: string;
  locationHint?: string;
  blogTitle?: string;
  isHtml?: boolean;
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function stripCodeFences(text: string): string {
  if (!text) return text;
  const fenced = text.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/);
  if (fenced?.[1]) return fenced[1].trim();
  return text.replace(/^```[a-zA-Z]*\s*/i, "").replace(/```\s*$/, "").trim();
}

function hasTargetLink(content: string, url: string, isHtml: boolean): boolean {
  if (!content || !url) return false;
  if (isHtml) {
    const escaped = escapeRegex(url);
    return new RegExp(`<a\\s+[^>]*href=["']${escaped}["'][^>]*>`, "i").test(content);
  }
  const escaped = escapeRegex(url);
  return new RegExp(`\\[[^\\]]+\\]\\(${escaped}\\)`, "i").test(content);
}

async function rewriteContextuallyWithAi(body: ApplyAiLinkBody): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const content = body.content || "";
  const anchorText = body.anchorText || "";
  const linkUrl = body.linkUrl || "";
  const oldLinkUrl = body.oldLinkUrl || "";
  const oldAnchorText = body.oldAnchorText || "";
  const locationHint = body.locationHint || "";
  const isHtml = body.isHtml === true;

  const formatInstruction = isHtml
    ? "Return valid HTML only. Preserve headings/paragraphs and output no markdown fences."
    : "Return markdown/plain text only. Preserve heading markers and markdown links [text](url).";

  const relocationInstruction = oldLinkUrl || oldAnchorText
    ? `There may be an existing link/anchor to replace. Old URL: "${oldLinkUrl || "none"}". Old anchor: "${oldAnchorText || "none"}". Prefer relocating to a better nearby phrase if needed.`
    : "Insert a new link at the most natural place in the section.";

  const hintInstruction = locationHint
    ? `Placement hint (optional): ${locationHint}`
    : "No placement hint provided.";

  const prompt = `Rewrite this section minimally to place a natural link.

Target link requirements:
- Destination URL must be exactly: ${linkUrl}
- Preferred anchor text: ${anchorText}
- You may adjust surrounding wording to make the anchor placement feel natural.
- Keep facts/meaning intact and keep length roughly similar.
- Keep only one link instance to the target URL in this section.

${relocationInstruction}
${hintInstruction}
${formatInstruction}

Output only rewritten content.

Content:
${content}`;

  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an expert medical content editor. Make subtle edits for natural internal/external link placement while preserving accuracy.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.35,
    max_tokens: 2500,
  });

  const rewritten = stripCodeFences(response.choices[0]?.message?.content || "");
  if (!rewritten.trim()) return null;
  if (!hasTargetLink(rewritten, linkUrl, isHtml)) return null;
  return rewritten;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isInsideMarkdownLink(text: string, position: number): boolean {
  const regex = /\[[^\]]*\]\([^\)]+\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (position >= match.index && position < match.index + match[0].length) {
      return true;
    }
  }
  return false;
}

function isInMarkdownHeading(text: string, position: number): boolean {
  const lines = text.substring(0, position).split("\n");
  const line = lines[lines.length - 1] || "";
  return /^#+\s+/.test(line.trimStart());
}

function rangesForTag(html: string, tagPattern: RegExp): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(html)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

function isInAnyRange(position: number, ranges: Array<{ start: number; end: number }>): boolean {
  return ranges.some((range) => position >= range.start && position < range.end);
}

function insertLinkMarkdown(content: string, anchorText: string, linkUrl: string): string {
  const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, "gi");
  const matches = [...content.matchAll(regex)];

  for (const match of matches) {
    const idx = match.index ?? -1;
    if (idx < 0) continue;
    if (isInsideMarkdownLink(content, idx)) continue;
    if (isInMarkdownHeading(content, idx)) continue;

    const found = match[0];
    const replacement = `[${found}](${linkUrl})`;
    return content.slice(0, idx) + replacement + content.slice(idx + found.length);
  }

  return `${content.trim()}\n\n[${anchorText}](${linkUrl})`;
}

function insertLinkHtml(content: string, anchorText: string, linkUrl: string): string {
  const linkRanges = rangesForTag(content, /<a\s[^>]*>[\s\S]*?<\/a>/gi);
  const headingRanges = rangesForTag(content, /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi);

  const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, "gi");
  const matches = [...content.matchAll(regex)];

  for (const match of matches) {
    const idx = match.index ?? -1;
    if (idx < 0) continue;
    if (isInAnyRange(idx, linkRanges)) continue;
    if (isInAnyRange(idx, headingRanges)) continue;

    const found = match[0];
    const replacement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${found}</a>`;
    return content.slice(0, idx) + replacement + content.slice(idx + found.length);
  }

  return `${content}<p><a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${anchorText}</a></p>`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ApplyAiLinkBody;
    const content = typeof body?.content === "string" ? body.content : "";
    const anchorText = typeof body?.anchorText === "string" ? body.anchorText.trim() : "";
    const linkUrl = typeof body?.linkUrl === "string" ? body.linkUrl.trim() : "";
    const oldLinkUrl = typeof body?.oldLinkUrl === "string" ? body.oldLinkUrl.trim() : "";
    const oldAnchorText = typeof body?.oldAnchorText === "string" ? body.oldAnchorText.trim() : "";
    const locationHint = typeof body?.locationHint === "string" ? body.locationHint.trim() : "";

    if (!content || !anchorText || !linkUrl) {
      return NextResponse.json(
        { error: "content, anchorText and linkUrl are required" },
        { status: 400 }
      );
    }

    // First try contextual AI rewrite, then fall back to deterministic insertion.
    try {
      const aiRewritten = await rewriteContextuallyWithAi({
        ...body,
        content,
        anchorText,
        linkUrl,
        oldLinkUrl,
        oldAnchorText,
        locationHint,
      });
      if (aiRewritten) {
        return NextResponse.json({ success: true, content: aiRewritten });
      }
    } catch (aiError) {
      console.warn("apply-ai-link contextual rewrite failed, using fallback:", aiError);
    }

    const rewritten = body.isHtml
      ? insertLinkHtml(content, anchorText, linkUrl)
      : insertLinkMarkdown(content, anchorText, linkUrl);

    return NextResponse.json({ success: true, content: rewritten });
  } catch (error) {
    console.error("apply-ai-link error:", error);
    const message = error instanceof Error ? error.message : "Failed to apply AI link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
