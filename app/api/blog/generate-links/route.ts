import { NextRequest, NextResponse } from "next/server";

type LinkType = "internal" | "external";

interface InternalBlogInput {
  title?: string;
  topic?: string;
  wixSlug?: string;
  metadata?: { slug?: string };
}

interface ExistingLinkInput {
  url?: string;
  text?: string;
}

interface ResearchSourceInput {
  title?: string;
  source?: string;
  url?: string;
}

interface GenerateLinksBody {
  sectionContent?: string;
  sectionTitle?: string;
  linkType?: LinkType;
  blogs?: InternalBlogInput[];
  existingLinks?: ExistingLinkInput[];
  researchSources?: ResearchSourceInput[];
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "into",
  "about",
  "have",
  "will",
  "their",
  "there",
  "which",
  "when",
  "where",
  "while",
  "during",
  "after",
  "before",
  "under",
  "over",
  "pain",
]);

function normalizeUrl(url: string): string {
  const trimmed = (url || "").trim();
  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    const value = parsed.toString();
    return value.endsWith("/") ? value.slice(0, -1) : value;
  } catch {
    return trimmed.replace(/\/$/, "");
  }
}

function stripHtml(value: string): string {
  return (value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findAnchorForKeyword(content: string, keyword: string): string | null {
  if (!keyword) return null;
  const pattern = new RegExp(`\\b${escapeRegex(keyword)}(?:\\s+\\w+){0,3}\\b`, "i");
  const match = content.match(pattern);
  if (!match || !match[0]) return null;

  const anchor = match[0].trim().replace(/[.,;:!?]+$/, "");
  return anchor.length >= 3 ? anchor : null;
}

function buildInternalSuggestions(body: GenerateLinksBody) {
  const content = stripHtml(body.sectionContent || "");
  const blogs = Array.isArray(body.blogs) ? body.blogs : [];

  const suggestions: Array<{
    blogIndex: number;
    anchorText: string;
    reason: string;
    confidence: number;
  }> = [];

  const usedAnchors = new Set<string>();

  blogs.forEach((blog, index) => {
    const blogTitle = (blog.title || blog.topic || "").trim();
    if (!blogTitle) return;

    const keywords = extractKeywords(blogTitle);
    let anchorText: string | null = null;

    for (const keyword of keywords) {
      anchorText = findAnchorForKeyword(content, keyword);
      if (anchorText) break;
    }

    if (!anchorText) return;

    const normalizedAnchor = anchorText.toLowerCase();
    if (usedAnchors.has(normalizedAnchor)) return;
    usedAnchors.add(normalizedAnchor);

    suggestions.push({
      blogIndex: index,
      anchorText,
      reason: `Matches topic keywords from "${blogTitle}"`,
      confidence: Math.min(0.95, 0.6 + Math.min(anchorText.split(/\s+/).length, 5) * 0.05),
    });
  });

  return suggestions.slice(0, 8);
}

function compactAnchorFromTitle(title: string): string {
  const words = title
    .replace(/\s*[|:\-–].*$/, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 5);

  if (words.length === 0) return "research guidance";

  const joined = words.join(" ");
  return joined[0].toLowerCase() + joined.slice(1);
}

function buildExternalSuggestions(body: GenerateLinksBody) {
  const existingLinks = Array.isArray(body.existingLinks) ? body.existingLinks : [];
  const researchSources = Array.isArray(body.researchSources) ? body.researchSources : [];

  const currentUrls = new Set(
    existingLinks
      .map((link) => (typeof link?.url === "string" ? normalizeUrl(link.url) : ""))
      .filter(Boolean)
  );

  const candidateSources = researchSources
    .filter((source) => typeof source?.url === "string" && source.url.trim().length > 0)
    .filter((source, index, array) => {
      const url = normalizeUrl(source.url || "");
      return array.findIndex((item) => normalizeUrl(item.url || "") === url) === index;
    });

  const unusedCandidates = candidateSources.filter(
    (source) => !currentUrls.has(normalizeUrl(source.url || ""))
  );

  const suggestions: Array<{
    action: "replace" | "add";
    oldUrl?: string;
    newUrl: string;
    oldAnchorText?: string;
    newAnchorText: string;
    reason: string;
  }> = [];

  for (let i = 0; i < existingLinks.length && i < unusedCandidates.length; i++) {
    const oldLink = existingLinks[i];
    const replacement = unusedCandidates[i];
    if (!oldLink?.url || !replacement?.url) continue;

    suggestions.push({
      action: "replace",
      oldUrl: oldLink.url,
      oldAnchorText: oldLink.text || "",
      newUrl: replacement.url,
      newAnchorText: compactAnchorFromTitle(replacement.title || ""),
      reason: "Uses a selected research source not yet linked in this section",
    });
  }

  // If there are still unused sources, suggest adding one.
  if (unusedCandidates.length > existingLinks.length) {
    const next = unusedCandidates[existingLinks.length];
    if (next?.url) {
      suggestions.push({
        action: "add",
        newUrl: next.url,
        newAnchorText: compactAnchorFromTitle(next.title || ""),
        reason: "Adds an additional relevant source link",
      });
    }
  }

  return suggestions.slice(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateLinksBody;
    const linkType = body?.linkType;

    if (!body?.sectionContent || !body?.sectionTitle || !linkType) {
      return NextResponse.json(
        { error: "sectionContent, sectionTitle and linkType are required" },
        { status: 400 }
      );
    }

    if (linkType !== "internal" && linkType !== "external") {
      return NextResponse.json(
        { error: "linkType must be either 'internal' or 'external'" },
        { status: 400 }
      );
    }

    const suggestions =
      linkType === "internal"
        ? buildInternalSuggestions(body)
        : buildExternalSuggestions(body);

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("generate-links error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate link suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
