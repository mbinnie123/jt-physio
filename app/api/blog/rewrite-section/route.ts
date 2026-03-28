import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface RewriteSectionBody {
  content?: string;
  sectionTitle?: string;
  mode?: "reword" | "paraphrase";
  preserveLinks?: boolean;
  isHtml?: boolean;
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }
  return new OpenAI({ apiKey });
}

function stripCodeFences(text: string): string {
  if (!text) return text;
  const fenced = text.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/);
  if (fenced?.[1]) return fenced[1].trim();
  return text.replace(/^```[a-zA-Z]*\s*/i, "").replace(/```\s*$/, "").trim();
}

function normalizeGeneratedHeadingMarkers(content: string): string {
  if (!content) return "";

  let normalized = content;
  normalized = normalized.replace(/\bH([1-6])\]([^\n]*?)\/H\1\]/gi, (_m, level, text) => {
    return `[H${level}]${String(text).trim()}[/H${level}]`;
  });
  normalized = normalized.replace(/\[H([1-6])\](.*?)\/H\1\]/gi, (_m, level, text) => {
    return `[H${level}]${String(text).trim()}[/H${level}]`;
  });
  normalized = normalized.replace(/\[\/?h([1-6])\]/gi, (_m, level) => {
    return _m.startsWith("[/") ? `[/H${level}]` : `[H${level}]`;
  });
  normalized = normalized.replace(/^\s{0,3}(#{1,6})\s*([^\n]+)$/gm, (_m, hashes, text) => {
    const level = Math.min(Math.max(hashes.length, 1), 6);
    return `[H${level}]${String(text).trim()}[/H${level}]`;
  });

  return normalized;
}

function fixUnclosedH3Tags(content: string): string {
  const openTagRegex = /\[H3\]/g;
  const closeTagRegex = /\[\/H3\]/g;
  const openCount = (content.match(openTagRegex) || []).length;
  const closeCount = (content.match(closeTagRegex) || []).length;
  if (openCount <= closeCount) return content;

  let result = content;
  const openPositions: number[] = [];
  const closePositions: number[] = [];
  let match: RegExpExecArray | null;
  const openRegex = /\[H3\]/g;
  const closeRegex = /\[\/H3\]/g;

  while ((match = openRegex.exec(content)) !== null) openPositions.push(match.index);
  while ((match = closeRegex.exec(content)) !== null) closePositions.push(match.index);

  for (let i = openPositions.length - 1; i >= 0; i--) {
    const openPos = openPositions[i];
    const hasClosing = closePositions.some((closePos) => closePos > openPos);
    if (!hasClosing) {
      const nextNewline = result.indexOf("\n", openPos + 4);
      const nextDoubleNewline = result.indexOf("\n\n", openPos + 4);
      const insertPos = nextDoubleNewline !== -1 ? nextDoubleNewline : (nextNewline !== -1 ? nextNewline : result.length);
      result = result.slice(0, insertPos) + "[/H3]" + result.slice(insertPos);
    }
  }

  return result;
}

function fixBrokenMarkdownLinks(content: string): string {
  if (!content) return content;
  let fixed = content;
  fixed = fixed.replace(/\[(?!H\d\])([^\[\]()]*?)(?=\s*[,.;!?\n]|$)/g, (match, captured) => {
    const startIdx = fixed.indexOf(match);
    const substr = fixed.substring(startIdx);
    if (!substr.match(/^\[[^\[\]]*\]\(https?:\/\/[^)]*\)/) && !substr.match(/^\[H\d\]/)) {
      return captured;
    }
    return match;
  });
  fixed = fixed.replace(/\[(?!H\d\])([^\[\]]*?)(?!\]\(https?:\/\/)/g, (match, captured) => {
    const startIdx = fixed.indexOf(match);
    const nextChars = fixed.substring(startIdx + match.length, startIdx + match.length + 20);
    if (!nextChars.startsWith("](")) {
      return captured;
    }
    return match;
  });
  fixed = fixed.replace(/(?<![\[\w])(\w[^\[]*?)\]\((https?:\/\/[^)]*)\)/g, (match, text, url) => {
    if (match[0] === "[") return match;
    return `[${text}](${url})`;
  });
  fixed = fixed.replace(/(\[([^\]]+)\]\(https?:\/\/[^)]+\))[)\-].*?(?=\s|$|[,.;!?])/g, "$1");
  fixed = fixed.replace(/(\[([^\]]+)\]\(https?:\/\/[^)]+\))\)+/g, "$1");
  fixed = fixed.replace(/\s{2,}/g, " ");
  fixed = fixed.replace(/\s+([,.;!?])/g, "$1");
  fixed = fixed.replace(/\n{3,}/g, "\n\n");
  return fixed;
}

function removeOrphanedBrackets(content: string): string {
  if (!content) return content;
  const lines = content.split("\n");
  const processed = lines.map((line) => {
    if (!line.includes("[")) return line;
    const bracketRegex = /\[(?!\/?H[1-6]\])([^\[\]]*?)(?!\]\([^)]*\))/g;
    let processedLine = line;
    let match: RegExpExecArray | null;
    const removals: number[] = [];
    while ((match = bracketRegex.exec(line)) !== null) {
      const restOfLine = line.substring(match.index + match[0].length);
      if (!restOfLine.startsWith("](") || !restOfLine.match(/^\]\(https?:\/\/[^)]*\)/)) {
        removals.push(match.index);
      }
    }
    for (let i = removals.length - 1; i >= 0; i--) {
      const start = removals[i];
      processedLine = processedLine.substring(0, start) + processedLine.substring(start + 1);
    }
    return processedLine;
  });
  return processed.join("\n").replace(/\[(?!\/?H[1-6]\])(?![^\[\]]*\]\([^)]*\))/g, "");
}

function sanitizeGeneratedMarkdownContent(content: string): string {
  if (!content) return content;
  let sanitized = normalizeGeneratedHeadingMarkers(content);
  sanitized = fixUnclosedH3Tags(sanitized);
  sanitized = fixBrokenMarkdownLinks(sanitized);
  sanitized = removeOrphanedBrackets(sanitized);
  // Extra hardening for model outputs like: H3]Title/H3] or text](https://...)
  sanitized = sanitized.replace(/(^|\n)\s*H([1-6])\]([^\n]*?)\/H\2\]\s*(?=\n|$)/g, (_m, prefix, level, text) => {
    return `${prefix}[H${level}]${String(text).trim()}[/H${level}]`;
  });
  sanitized = sanitized.replace(/(?<!\[)\/H([1-6])\]/g, "[/H$1]");
  sanitized = sanitized.replace(/(^|[\s(>])([^\[\]\n][^\]\n]{1,120}?)\]\((https?:\/\/[^)\s]+)\)/g, (_m, prefix, anchor, url) => {
    const cleanedAnchor = String(anchor).trim();
    if (!cleanedAnchor) return _m;
    return `${prefix}[${cleanedAnchor}](${url})`;
  });
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RewriteSectionBody;
    const content = typeof body?.content === "string" ? body.content : "";
    const sectionTitle =
      typeof body?.sectionTitle === "string" ? body.sectionTitle : "Section";
    const mode: "reword" | "paraphrase" =
      body?.mode === "paraphrase" ? "paraphrase" : "reword";
    const preserveLinks = body?.preserveLinks !== false;
    const isHtml = body?.isHtml === true;

    if (!content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const actionInstruction =
      mode === "paraphrase"
        ? "Paraphrase the content deeply while preserving meaning and factual intent."
        : "Reword the content for clarity and flow without changing meaning.";

    const linkInstruction = preserveLinks
      ? "Preserve all existing links exactly as-is. Keep same linked URLs and anchor text when possible."
      : "You may adjust links only if absolutely necessary, but do not remove useful links.";

    const formatInstruction = isHtml
      ? "Return valid HTML only. Keep paragraph and heading structure."
      : "Return markdown/plain text only. Keep heading markers and link markdown format [text](url).";

    const prompt = `Rewrite the following blog section titled \"${sectionTitle}\".

${actionInstruction}
${linkInstruction}
${formatInstruction}

Rules:
- Do not add new facts or claims.
- Keep a professional physiotherapy tone.
- Keep approximately similar length.
- Output ONLY the rewritten content. No commentary.

SEO BOLDING RULES (apply or preserve):
- Use **bold** for 5–10% of text only — key clinical terms, target keywords, and important takeaways.
- Bold the primary topic keyword once in the opening and 1–2 natural placements in the body.
- Bold key phrases readers would scan for (e.g., **return-to-play protocol**, **load management**).
- Bold the key takeaway at the end of major paragraphs or sections.
- Never bold whole sentences or paragraphs; never use bold as a heading substitute.
- If the input already has appropriate bold, preserve it.

Content:
${content}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert medical content editor for physiotherapy articles. Preserve meaning and structure while improving language quality.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: mode === "paraphrase" ? 0.7 : 0.45,
      max_tokens: 2500,
    });

    const rewrittenRaw = response.choices[0]?.message?.content || "";
    const rewritten = stripCodeFences(rewrittenRaw);
    const normalizedContent = isHtml
      ? rewritten
      : sanitizeGeneratedMarkdownContent(rewritten);

    if (!normalizedContent.trim()) {
      return NextResponse.json(
        { error: "Rewrite returned empty content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content: normalizedContent });
  } catch (error) {
    console.error("rewrite-section error:", error);
    const message = error instanceof Error ? error.message : "Failed to rewrite section";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
