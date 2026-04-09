"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { convertToRicos, ricosToHtml } from "@/lib/blog-automation/writer-utils";
import { BlogPostBody } from "@/app/components/BlogPostBody";

interface BlogDraft {
  id: string;
  topic: string;
  location?: string; // Location (e.g., "Kilmarnock, Ayrshire")
  sport?: string; // Sport (e.g., "Football, Tennis")
  status: "draft" | "writing" | "assembled" | "published";
  sections: any[];
  metadata: any;
  researchData?: ResearchData;
  selectedSourceIds: string[]; // Track selected sources
  includeChecklist?: boolean;
  includeFaq?: boolean;
  includeInternalCta?: boolean;
  includeOverview?: boolean;
  includeAuthorTakeaway?: boolean;
  authorTakeawayText?: string;
  publishedAt?: string;
  wixPostId?: string;
  createdAt: string;
}

interface ResearchData {
  sources: any[];
  keywords: string[];
}
interface ImageMetadata {
  altText: string;
  caption: string;
  description: string;
  keywords: string[];
}

interface DraftAutosaveSnapshot {
  draftId: string;
  updatedAt: string;
  sections: any[];
  outline: string[];
  editableOutline: string[];
  sectionTargetWords: number[];
  currentSectionIndex: number;
  researchData: ResearchData | null;
  selectedSourceIds: string[];
  editableDraftLocation: string;
  editableDraftTopic: string;
  editableDraftSport: string;
  editableTitle: string;
  editableSlug: string;
  editableExcerpt: string;
  editableSeoTitle: string;
  editableSeoDescription: string;
  editableFeaturedImageUrl: string;
  editableContent: string;
  includeChecklist: boolean;
  includeFaq: boolean;
  includeInternalCta: boolean;
  includeOverview: boolean;
  includeAuthorTakeaway: boolean;
  authorTakeawayText: string;
}

interface CreateFormAutosaveSnapshot {
  newLocation: string;
  newTopic: string;
  newSport: string;
  numSections: number;
  includeChecklist: boolean;
  includeFaq: boolean;
  includeInternalCta: boolean;
  includeOverview: boolean;
  includeAuthorTakeaway: boolean;
  authorTakeawayText: string;
}

// ============================================================================
// Safe JSON Parsing & Retry Helpers
// ============================================================================

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function generateTargetWordCounts(sections: string[]): number[] {
  return sections.map((title: string) => {
    const lower = title.toLowerCase();
    
    // Introduction/opening sections - shorter
    if (lower.includes("introduction") || lower.includes("overview") || lower.includes("what is")) {
      return 300;
    }
    
    // Conclusion/closing sections - medium
    if (lower.includes("conclusion") || lower.includes("summary") || lower.includes("takeaway")) {
      return 350;
    }
    
    // How-to/Tips/Guide sections - longer
    if (lower.includes("how to") || lower.includes("tips") || lower.includes("guide") || 
        lower.includes("step") || lower.includes("treatment") || lower.includes("exercise")) {
      return 500;
    }
    
    // Benefits/Risks/Causes - medium-long
    if (lower.includes("benefit") || lower.includes("risk") || lower.includes("cause") || 
        lower.includes("symptom") || lower.includes("effect")) {
      return 450;
    }
    
    // Main content sections - longer
    if (lower.includes("research") || lower.includes("finding") || lower.includes("details") ||
        lower.includes("explanation")) {
      return 400;
    }
    
    // Default for other sections
    return 400;
  });
}

function extractLinksFromHtml(html: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const text = match[2];
    // Only add unique URLs
    if (!links.some(link => link.url === url)) {
      links.push({ url, text });
    }
  }
  
  return links;
}

function extractLinksFromMarkdown(content: string): Array<{ url: string; text: string }> {
  const links: Array<{ url: string; text: string }> = [];
  const markdownPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownPattern.exec(content)) !== null) {
    const text = match[1]?.trim();
    const url = match[2]?.trim();
    if (!text || !url) continue;
    if (!links.some((link) => link.url === url && link.text === text)) {
      links.push({ text, url });
    }
  }

  return links;
}

/**
 * Pick anchor text from `bodyText` for a link pointing at `blog`.
 *
 * Rules (per SEO best practice):
 *  1. Find a natural phrase in the BODY that contains a topic keyword and is ≤5 words.
 *  2. Phrase must start at a word boundary and not be a heading or existing link.
 *  3. Strip leading stopwords so the phrase is descriptive.
 *  4. Never use generic link text ("click here", "read more", "this page", etc.).
 *  5. Fall back to a trimmed version of the blog title (capped at 5 words) if nothing fits.
 */
function pickAnchorText(blog: any, bodyText: string): string {
  const GENERIC = /^(click here|read more|this page|here|learn more|find out|more info|more information|view|see here|go here)$/i;
  const MAX_WORDS = 5;

  const title: string = blog.title || blog.topic || '';
  const topic: string = blog.topic || blog.title || '';

  // Build ordered candidate keywords: prefer multi-word phrases first, then single words
  const topicWords = topic.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const candidates: string[] = [];

  // Bigrams first (more specific)
  for (let i = 0; i < topicWords.length - 1; i++) {
    candidates.push(`${topicWords[i]} ${topicWords[i + 1]}`);
  }
  candidates.push(...topicWords);

  // Search bodyText for each candidate, then capture a natural phrase (≤5 words) around it
  for (const keyword of candidates) {
    const safeKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Capture the keyword plus any following qualifying words (up to 5 total)
    const phraseRegex = new RegExp(
      `\\b((?:\\w+\\s+){0,2}${safeKw}(?:\\s+\\w+){0,2})\\b`,
      'i'
    );
    const m = bodyText.match(phraseRegex);
    if (m) {
      const phrase = m[1].trim().replace(/[.,;:!?]+$/, '');
      const wordCount = phrase.split(/\s+/).length;
      if (wordCount >= 1 && wordCount <= MAX_WORDS && !GENERIC.test(phrase)) {
        return phrase;
      }
    }
  }

  // Fall back to blog title, capped at MAX_WORDS words
  const titleWords = title.trim().split(/\s+/);
  const capped = titleWords.slice(0, MAX_WORDS).join(' ').replace(/[.,;:!?]+$/, '');
  return capped || title;
}

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.length > 300 ? text.slice(0, 300) + "…" : text;
    throw new Error(`Invalid JSON returned from ${res.url}. Snippet: ${snippet}`);
  }
}

async function fetchJsonWithRetry(
  url: string,
  options: RequestInit,
  retries = 1
): Promise<{ res: Response; json: any }> {
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Retry transient errors
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        await sleep(700 * (attempt + 1));
        continue;
      }

      const json = await readJsonSafely(res);
      return { res, json };
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      throw lastErr;
    }
  }

  throw lastErr ?? new Error("Unknown fetch error");
}

function buildSourceId(source: any, index: number): string {
  if (source?.url && typeof source.url === "string") {
    return source.url;
  }

  const title = typeof source?.title === "string" ? source.title.trim() : "source";
  const provider = typeof source?.source === "string" ? source.source.trim() : "unknown";
  return `${title}::${provider}::${index}`;
}

// ============================================================================
// Default Image Prompt Template
// ============================================================================

const DEFAULT_IMAGE_PROMPT_TEMPLATE = `Create a professional, medical-illustration style image for a physiotherapy blog post section titled "\${sectionTitle}" about "\${topic}".

The section covers: \${contentPreview}

Key concepts to visualize: \${keywords}

Requirements:
- Clean, professional medical illustration style
- Shows practical application or anatomical relevance
- Includes people demonstrating exercises or movements when appropriate
- Professional color palette suitable for healthcare content
- High quality, suitable for web use
- Focus on clarity and educational value
- No text or watermarks on the image

Create an illustration that clearly represents the key concepts discussed in this section.`;

const CREATE_FORM_AUTOSAVE_KEY = "blog_create_form_autosave_v1";
const DRAFT_AUTOSAVE_KEY_PREFIX = "blog_draft_autosave_v1:";

function getDraftAutosaveKey(draftId: string): string {
  return `${DRAFT_AUTOSAVE_KEY_PREFIX}${draftId}`;
}

function parseDraftAutosaveSnapshot(raw: string | null): DraftAutosaveSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DraftAutosaveSnapshot;
    if (!parsed || typeof parsed !== "object" || typeof parsed.draftId !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseCreateFormAutosave(raw: string | null): CreateFormAutosaveSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CreateFormAutosaveSnapshot;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}



// Helper function to get a clean preview of content (cuts at sentence boundary)
function getPreviewText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // Try to cut at a sentence boundary (period followed by space)
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(". ");
  
  if (lastPeriod > 0 && lastPeriod > maxLength * 0.7) {
    // Cut at the period if it's not too early
    return truncated.substring(0, lastPeriod + 1);
  }
  
  // Otherwise, cut at the last word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace);
  }
  
  // Fallback: just cut at maxLength
  return truncated;
}

// ============================================================================
// Admin Dashboard Component
// ============================================================================

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<BlogDraft | null>(null);
  const [newLocation, setNewLocation] = useState(""); // Location (e.g., "Kilmarnock, Ayrshire")
  const [newTopic, setNewTopic] = useState(""); // Topic (e.g., "Sports Injury Recovery")
  const [newSport, setNewSport] = useState(""); // Sport (e.g., "Amateur Footballers")
  const [numSections, setNumSections] = useState(5); // Number of sections to generate
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeInternalCta, setIncludeInternalCta] = useState(true);
  const [includeOverview, setIncludeOverview] = useState(true);
  const [includeAuthorTakeaway, setIncludeAuthorTakeaway] = useState(true);
  const [authorTakeawayText, setAuthorTakeawayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [savingContentOptions, setSavingContentOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit" | "published">("list");
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [outline, setOutline] = useState<string[]>([]);
  const [editableOutline, setEditableOutline] = useState<string[]>([]); // Editable outline items
  const [sectionTargetWords, setSectionTargetWords] = useState<number[]>([]); // Target word count per section
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [writingSection, setWritingSection] = useState(false); // Loading state for writing
  const [editableDraftLocation, setEditableDraftLocation] = useState(""); // Editable location
  const [editableDraftTopic, setEditableDraftTopic] = useState(""); // Editable topic
  const [editableDraftSport, setEditableDraftSport] = useState(""); // Editable sport
  const [assembledBlog, setAssembledBlog] = useState<any>(null); // Store assembled blog data
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(null); // For viewing full section content
  const [viewingOutlineImageIndex, setViewingOutlineImageIndex] = useState<number | null>(null); // For viewing outline section images
  const [viewingWrittenImageIndex, setViewingWrittenImageIndex] = useState<number | null>(null); // For viewing written section images
  const [sectionImages, setSectionImages] = useState<Record<number, string>>({}); // Track generated section images
  const [sectionImageMetadata, setSectionImageMetadata] = useState<Record<number, { altText: string; caption: string; description: string; keywords: string[] }>>({}); // Track image metadata
  const [generatingSectionImage, setGeneratingSectionImage] = useState<number | null>(null); // Which section is generating image
  const [regeneratingOutlineSection, setRegeneratingOutlineSection] = useState<number | null>(null); // Which outline section is being regenerated
  const [imageOptimizationFeedback, setImageOptimizationFeedback] = useState<Record<number, string>>({}); // Show optimization info
  const [regeneratingExtras, setRegeneratingExtras] = useState(false); // Track if regenerating all extras
  const [wixPosts, setWixPosts] = useState<any[]>([]); // Existing Wix posts
  const [loadingWixPosts, setLoadingWixPosts] = useState(false);
  const [showWixPostsModal, setShowWixPostsModal] = useState(false); // Show existing posts modal
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null); // Track which section is regenerating (faqs, checklist, links)
  
  // Editable metadata fields
  const [editableTitle, setEditableTitle] = useState("");
  const [editableSlug, setEditableSlug] = useState("");
  const [editableExcerpt, setEditableExcerpt] = useState("");
  const [editableSeoTitle, setEditableSeoTitle] = useState("");
  const [editableSeoDescription, setEditableSeoDescription] = useState("");
  const [editableFeaturedImageUrl, setEditableFeaturedImageUrl] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]); // Track selected sources
  const [researchQuery, setResearchQuery] = useState(""); // Search query for "Add More Sources"
  const [reapplyingMetadata, setReapplyingMetadata] = useState(false);
  const [viewLinksMode, setViewLinksMode] = useState(false); // Toggle between content and links view
  const [generatingImage, setGeneratingImage] = useState(false); // Image generation state
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null); // Store generated image
  const [selectedSourceForModal, setSelectedSourceForModal] = useState<any | null>(null); // Source being viewed in detail modal
  const [loadingSourceContent, setLoadingSourceContent] = useState(false); // Loading full content for modal
  const [showImagePromptEditor, setShowImagePromptEditor] = useState(false); // Show image prompt editor modal
  const [customImagePrompt, setCustomImagePrompt] = useState<string>(""); // Custom image generation prompt template
  const [externalLinksPerSection, setExternalLinksPerSection] = useState<number>(3); // Number of external source links per section
  const [internalLinksPerSection, setInternalLinksPerSection] = useState<number>(2); // Number of internal links per section
  const [publishedBlogs, setPublishedBlogs] = useState<any[]>([]); // All published blog posts
  const [relevantBlogs, setRelevantBlogs] = useState<any[]>([]); // Blogs relevant to current section
  const [loadingPublishedBlogs, setLoadingPublishedBlogs] = useState(false); // Loading state for published blogs
  const [selectedBlogForModal, setSelectedBlogForModal] = useState<any | null>(null); // Blog being viewed in modal
  const [loadingBlogDetails, setLoadingBlogDetails] = useState(false); // Loading blog details for modal
  const [selectedSectionForLinks, setSelectedSectionForLinks] = useState<number | null>(null); // Section selected for managing internal links
  
  // AI Link Generation
  const [aiLinkSuggestions, setAiLinkSuggestions] = useState<any[]>([]); // AI-generated link suggestions
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false); // Loading state for AI suggestions
  const [showAiLinkModal, setShowAiLinkModal] = useState(false); // Show AI link suggestion modal
  const [selectedAiSuggestion, setSelectedAiSuggestion] = useState<any | null>(null); // Currently selected AI suggestion

  // AI External Link Suggestions
  const [aiExternalSuggestions, setAiExternalSuggestions] = useState<any[]>([]); // AI-generated external link suggestions
  const [loadingExternalAiSuggestions, setLoadingExternalAiSuggestions] = useState(false);
  const [showExternalAiModal, setShowExternalAiModal] = useState(false);
  const [selectedExternalSuggestion, setSelectedExternalSuggestion] = useState<any | null>(null);
  const [applyingExternalSuggestion, setApplyingExternalSuggestion] = useState(false);
  const [lastLocalAutosaveAt, setLastLocalAutosaveAt] = useState<string>("");

  const clearDraftAutosave = (draftId: string) => {
    if (!draftId) return;
    localStorage.removeItem(getDraftAutosaveKey(draftId));
    if (selectedDraft?.id === draftId) {
      setLastLocalAutosaveAt("");
    }
  };

  const hydrateDraftEditor = (draft: BlogDraft) => {
    const savedSnapshot = parseDraftAutosaveSnapshot(
      localStorage.getItem(getDraftAutosaveKey(draft.id))
    );
    const snapshotMatchesDraft = savedSnapshot?.draftId === draft.id;

    const includeChecklistValue = snapshotMatchesDraft
      ? savedSnapshot.includeChecklist
      : draft.includeChecklist !== false;
    const includeFaqValue = snapshotMatchesDraft
      ? savedSnapshot.includeFaq
      : draft.includeFaq !== false;
    const includeInternalCtaValue = snapshotMatchesDraft
      ? savedSnapshot.includeInternalCta
      : draft.includeInternalCta !== false;
    const includeOverviewValue = snapshotMatchesDraft
      ? savedSnapshot.includeOverview
      : draft.includeOverview !== false;
    const includeAuthorTakeawayValue = snapshotMatchesDraft
      ? savedSnapshot.includeAuthorTakeaway
      : draft.includeAuthorTakeaway === true;
    const authorTakeawayTextValue = snapshotMatchesDraft
      ? savedSnapshot.authorTakeawayText || ""
      : draft.authorTakeawayText || "";

    setIncludeChecklist(includeChecklistValue);
    setIncludeFaq(includeFaqValue);
    setIncludeInternalCta(includeInternalCtaValue);
    setIncludeOverview(includeOverviewValue);
    setIncludeAuthorTakeaway(includeAuthorTakeawayValue);
    setAuthorTakeawayText(authorTakeawayTextValue);
    
    // Ensure all sections have contentHtml
    const sourceSections = snapshotMatchesDraft ? savedSnapshot.sections : draft.sections;
    const sectionsWithHtml = (sourceSections || []).map((section: any) => {
      if (!section.contentHtml && section.content && typeof section.content === 'object') {
        // Generate contentHtml from Ricos object if it doesn't exist
        return {
          ...section,
          contentHtml: ricosToHtml(section.content)
        };
      }
      return section;
    });
    
    setSections(sectionsWithHtml);
    
    // Reconstruct outline from existing sections
    const reconstructedOutline = sectionsWithHtml
      .filter((s: any) => s && s.title)
      .map((s: any) => s.title);
    const restoredOutline = snapshotMatchesDraft
      ? savedSnapshot.outline || reconstructedOutline
      : reconstructedOutline;
    const restoredEditableOutline = snapshotMatchesDraft
      ? savedSnapshot.editableOutline || restoredOutline
      : restoredOutline;
    const restoredTargetWords = snapshotMatchesDraft
      ? savedSnapshot.sectionTargetWords || generateTargetWordCounts(restoredEditableOutline)
      : generateTargetWordCounts(restoredEditableOutline);

    setOutline(restoredOutline);
    setEditableOutline(restoredEditableOutline);
    setSectionTargetWords(restoredTargetWords);
    
    // Auto-detect next unwritten section
    const nextUnwrittenIndex = sectionsWithHtml.findIndex((section: any) => 
      !section || !section.content || 
      (typeof section.content === 'object' && Object.keys(section.content).length === 0)
    );
    const nextIndex = nextUnwrittenIndex >= 0 ? nextUnwrittenIndex : 0;
    const restoredSectionIndex = snapshotMatchesDraft
      ? Math.min(
          Math.max(savedSnapshot.currentSectionIndex || 0, 0),
          Math.max(restoredEditableOutline.length - 1, 0)
        )
      : nextIndex;
    setCurrentSectionIndex(restoredSectionIndex);
    setResearchData(snapshotMatchesDraft ? savedSnapshot.researchData : draft.researchData || null);

    const restoredSourceIds = snapshotMatchesDraft
      ? savedSnapshot.selectedSourceIds || []
      : draft.selectedSourceIds || [];
    const restoredLocation = snapshotMatchesDraft
      ? savedSnapshot.editableDraftLocation || ""
      : draft.location || "";
    const restoredTopic = snapshotMatchesDraft
      ? savedSnapshot.editableDraftTopic || draft.topic || ""
      : draft.topic || "";
    const restoredSport = snapshotMatchesDraft
      ? savedSnapshot.editableDraftSport || ""
      : draft.sport || "";
    const restoredTitle = snapshotMatchesDraft
      ? savedSnapshot.editableTitle || draft.metadata?.title || draft.topic || ""
      : draft.metadata?.title || draft.topic || "";
    const restoredSlug = snapshotMatchesDraft
      ? savedSnapshot.editableSlug || draft.metadata?.slug || ""
      : draft.metadata?.slug || "";
    const restoredExcerpt = snapshotMatchesDraft
      ? savedSnapshot.editableExcerpt || draft.metadata?.excerpt || ""
      : draft.metadata?.excerpt || "";
    const restoredSeoTitle = snapshotMatchesDraft
      ? savedSnapshot.editableSeoTitle || draft.metadata?.seoTitle || ""
      : draft.metadata?.seoTitle || "";
    const restoredSeoDescription = snapshotMatchesDraft
      ? savedSnapshot.editableSeoDescription || draft.metadata?.seoDescription || ""
      : draft.metadata?.seoDescription || "";
    const restoredFeaturedImage = snapshotMatchesDraft
      ? savedSnapshot.editableFeaturedImageUrl || draft.metadata?.featuredImageUrl || ""
      : draft.metadata?.featuredImageUrl || "";

    setSelectedSourceIds(restoredSourceIds);
    setEditableDraftLocation(restoredLocation);
    setEditableDraftTopic(restoredTopic);
    setEditableDraftSport(restoredSport);
    setEditableTitle(restoredTitle);
    setEditableSlug(restoredSlug);
    setEditableExcerpt(restoredExcerpt);
    setEditableSeoTitle(restoredSeoTitle);
    setEditableSeoDescription(restoredSeoDescription);
    setEditableFeaturedImageUrl(restoredFeaturedImage);
    const content = sectionsWithHtml
      .map((section: any) => {
        if (!section?.title || !section?.content) {
          return "";
        }
        // Handle both string and Ricos object content
        const contentText = typeof section.content === 'string'
          ? section.content
          : section.contentHtml
          ? section.contentHtml.replace(/<[^>]*>/g, '')
          : '';
        return `## ${section.title}\n\n${contentText}`;
      })
      .filter(Boolean)
      .join("\n\n");
    setEditableContent(snapshotMatchesDraft ? savedSnapshot.editableContent || content : content);

    setSelectedDraft({
      ...draft,
      location: restoredLocation,
      topic: restoredTopic,
      sport: restoredSport,
      sections: sectionsWithHtml,
      selectedSourceIds: restoredSourceIds,
      includeChecklist: includeChecklistValue,
      includeFaq: includeFaqValue,
      includeInternalCta: includeInternalCtaValue,
      includeOverview: includeOverviewValue,
      includeAuthorTakeaway: includeAuthorTakeawayValue,
      authorTakeawayText: authorTakeawayTextValue,
    });

    setLastLocalAutosaveAt(
      snapshotMatchesDraft && savedSnapshot.updatedAt ? savedSnapshot.updatedAt : ""
    );
  };

  const persistGeneratedContentOptions = async (
    draftId: string,
    updates: Partial<BlogDraft>
  ) => {
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth || !draftId) return;

    setSavingContentOptions(true);
    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ draftId, ...updates }),
        },
        1
      );

      if (!response.ok) {
        const message = data?.error || `HTTP ${response.status}: Failed to save options`;
        alert(message);
        return;
      }

      if (data?.draft) {
        setSelectedDraft(data.draft);
        setDrafts((prev) =>
          prev.map((draft) => (draft.id === data.draft.id ? data.draft : draft))
        );
      }
    } catch (error) {
      console.error("Failed to save generated content options:", error);
      alert(error instanceof Error ? error.message : "Failed to save options");
    } finally {
      setSavingContentOptions(false);
    }
  };

  const persistSelectedSources = async (
    draftId: string,
    updatedIds: string[]
  ) => {
    if (!draftId) return;
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) return;

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId,
            selectedSourceIds: updatedIds,
          }),
        },
        1
      );

      if (!response.ok) {
        const message =
          data?.error ||
          `HTTP ${response.status}: Failed to save source selection`;
        console.error("Persist sources failed:", message);
        return;
      }

      if (data?.draft) {
        setDrafts((prev) =>
          prev.map((draft) =>
            draft.id === draftId ? data.draft : draft
          )
        );
      }
    } catch (error) {
      console.error("Failed to persist selected sources:", error);
    }
  };

  const persistResearchState = async (
    draftId: string,
    updatedResearchData: ResearchData,
    updatedIds: string[]
  ) => {
    if (!draftId) return;
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) return;

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId,
            researchData: updatedResearchData,
            selectedSourceIds: updatedIds,
          }),
        },
        1
      );

      if (!response.ok) {
        const message =
          data?.error ||
          `HTTP ${response.status}: Failed to save source changes`;
        console.error("Persist research state failed:", message);
        return;
      }

      if (data?.draft) {
        setSelectedDraft((prev) =>
          prev?.id === data.draft.id ? data.draft : prev
        );
        setDrafts((prev) =>
          prev.map((draft) =>
            draft.id === draftId ? data.draft : draft
          )
        );
      }
    } catch (error) {
      console.error("Failed to persist research state:", error);
    }
  };

  const loadPublishedBlogs = async () => {
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in first");
      return;
    }

    setLoadingPublishedBlogs(true);
    try {
      // Fetch local published/assembled blogs
      const localResponse = await fetch("/api/blog/research", {
        headers: { 
          Authorization: auth,
          "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
        },
      });
      
      let localBlogs: any[] = [];
      if (localResponse.ok) {
        const data = await localResponse.json();
        console.log("All drafts from API:", data.drafts);
        
        // Get published/assembled blogs
        let published = (data.drafts || []).filter((draft: BlogDraft) => draft.status === "published" || draft.status === "assembled");
        console.log(`Found ${published.length} local published/assembled blogs`);
        
        // Enrich local blogs with content details
        localBlogs = published.map((blog: BlogDraft) => {
          const sectionTitles = (blog.sections || []).filter((s: any) => s && s.title).map((s: any) => s.title);
          const sectionContent = (blog.sections || []).filter((s: any) => s && s.content)
            .map((s: any) => {
              if (typeof s.content === 'string') return s.content;
              if (s.contentHtml) return s.contentHtml.replace(/<[^>]*>/g, '');
              return '';
            })
            .join(' ');
          
          const allText = `${blog.topic} ${blog.metadata?.title} ${blog.metadata?.excerpt} ${blog.metadata?.seoDescription} ${sectionTitles.join(' ')}`.toLowerCase();
          
          return {
            ...blog,
            source: 'local' as const,
            sectionCount: sectionTitles.length,
            sections: sectionTitles,
            contentPreview: sectionContent.substring(0, 300) + (sectionContent.length > 300 ? '...' : ''),
            fullContent: sectionContent,
            allText: allText,
          };
        });
      }
      
      // Fetch Wix published posts
      let wixBlogs: any[] = [];
      try {
        const wixResponse = await fetch("/api/blog/wix-posts", {
          headers: { 
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
          },
        });
        
        if (wixResponse.ok) {
          const wixData = await wixResponse.json();
          console.log(`Found ${wixData.posts?.length || 0} Wix published posts`);
          
          // Normalize Wix posts to match local blog structure
          // Note: fullContent is intentionally empty for Wix posts - it will be fetched when modal opens
          wixBlogs = (wixData.posts || []).map((post: any) => ({
            id: post.id,
            title: post.title,
            topic: post.title,
            excerpt: post.excerpt || '',
            url: post.url || '',
            source: 'wix' as const,
            wixPostId: post.id,
            wixSlug: post.slug,
            featuredImage: post.featuredImage,
            updatedDate: post.updatedDate,
            sectionCount: 0,
            sections: [],
            contentPreview: post.excerpt || 'Wix published post',
            fullContent: '', // Empty - will be fetched on modal open
            allText: `${post.title} ${post.excerpt}`.toLowerCase(),
          }));
        }
      } catch (wixError) {
        console.log("Could not fetch Wix posts (optional):", wixError);
      }
      
      // Combine both sources
      const allBlogs = [...localBlogs, ...wixBlogs];
      setPublishedBlogs(allBlogs);

      if (allBlogs.length === 0) {
        alert("No published blog posts found yet.\n\nTo see available blogs for linking:\n1. Create a blog draft\n2. Generate an outline\n3. Write sections\n4. Click 'Assemble Blog'\n\nOr publish existing Wix posts.");
      } else {
        const localCount = localBlogs.length;
        const wixCount = wixBlogs.length;
        const message = wixCount > 0 
          ? `Loaded ${allBlogs.length} blog posts (${localCount} local + ${wixCount} from Wix)!`
          : `Loaded ${allBlogs.length} blog post${allBlogs.length !== 1 ? 's' : ''}!`;
        alert(message);
      }
      return allBlogs;
    } catch (error) {
      console.error("Failed to load published blogs:", error);
      alert(`Error loading blogs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingPublishedBlogs(false);
    }
    return [];
  };

  const openBlogModal = async (blog: any) => {
    setSelectedBlogForModal(blog);
    
    // If it's a Wix post, fetch full details
    if (blog.source === 'wix' && blog.wixPostId) {
      setLoadingBlogDetails(true);
      const auth = localStorage.getItem("admin_auth") || "";
      try {
        const response = await fetch(`/api/blog/wix-posts?action=details&postId=${blog.wixPostId}`, {
          headers: { Authorization: auth },
        });
        if (response.ok) {
          const data = await response.json();
          const fullPost = data.post;
          
          // Log all available content fields for debugging
          console.log("[Modal] Available post fields:", {
            hasContent: !!fullPost.content,
            contentLength: fullPost.content?.length || 0,
            hasRichContent: !!fullPost.richContent,
            richContentNodesCount: fullPost.richContent?.nodes?.length || 0,
            hasHtmlBody: !!fullPost.htmlBody,
            htmlBodyLength: fullPost.htmlBody?.length || 0,
            hasBody: !!fullPost.body,
            bodyLength: fullPost.body?.length || 0,
            hasExcerpt: !!fullPost.excerpt,
            excerptLength: fullPost.excerpt?.length || 0,
          });
          
          // Extract full content from multiple sources with fallback chain
          let fullContent = '';
          
          // Try 1: Direct content field
          if (fullPost.content && typeof fullPost.content === 'string' && fullPost.content.length > 50) {
            fullContent = fullPost.content;
            console.log("[Modal] ✓ Using direct content field:", fullContent.length, "chars");
          }
          
          // Try 2: Extract from richContent nodes
          if (!fullContent && fullPost.richContent && fullPost.richContent.nodes) {
            fullContent = extractTextFromWixNodes(fullPost.richContent.nodes);
            console.log("[Modal] ✓ Extracted from richContent nodes:", fullContent.length, "chars");
          }
          
          // Try 3: Parse HTML body from V2 API (prefer htmlBody first as it's from V2)
          if (!fullContent && fullPost.htmlBody) {
            fullContent = extractTextFromHtml(fullPost.htmlBody);
            console.log("[Modal] ✓ Extracted from htmlBody (V2):", fullContent.length, "chars");
          }
          
          // Try 4: Parse body field
          if (!fullContent && fullPost.body) {
            fullContent = extractTextFromHtml(fullPost.body);
            console.log("[Modal] ✓ Extracted from body:", fullContent.length, "chars");
          }
          
          // Try 5: Fallback to excerpt
          if (!fullContent) {
            fullContent = fullPost.excerpt || '';
            console.log("[Modal] ⚠️ Using excerpt as fallback:", fullContent.length, "chars");
          }
          
          // Final validation
          if (fullContent.length === 0) {
            console.warn("[Modal] ⚠️ No content found in any field!");
          }
          
          console.log("[Modal] Final content summary:", {
            length: fullContent.length,
            preview: fullContent.substring(0, 100) + (fullContent.length > 100 ? '...' : ''),
            endsWithEllipsis: fullContent.trim().endsWith('...'),
          });
          
          // Update modal with full content and ensure URL is set
          setSelectedBlogForModal((prev: any) => prev ? ({
            ...prev,
            ...fullPost,
            fullContent: fullContent,
            // Ensure URL is always defined with fallback to original
            url: fullPost.url || prev.url || `/${prev.wixSlug || 'blog'}`,
          }) : null);
        }
      } catch (error) {
        console.error("Failed to load Wix post details:", error);
      } finally {
        setLoadingBlogDetails(false);
      }
    }
  };

  const closeBlogModal = () => {
    setSelectedBlogForModal(null);
  };

  // Count existing internal links in a section
  const countInternalLinksInSection = (sectionIndex: number): number => {
    if (sectionIndex >= sections.length) return 0;
    const section = sections[sectionIndex];
    if (!section) return 0;

    const content = typeof section.content === 'string' ? section.content : (section.contentHtml || '');
    // Count "Related:" markers which indicate internal blog links
    const linkCount = (content.match(/\*\*Related:\*\*|<strong>Related:<\/strong>/g) || []).length;
    return linkCount;
  };

  const isInternalBlogLink = (url: string): boolean => {
    if (!url) return false;

    return (
      url.startsWith("/") ||
      url.includes("jordanphysiotherapyayrshire.co.uk") ||
      url.includes("www.jordanphysiotherapyayrshire.co.uk")
    );
  };

  const getExternalSectionLinks = (section: any): Array<{ text: string; url: string }> => {
    return getSectionLinks(section).filter((link) => !isInternalBlogLink(link.url));
  };

  // Helper: Extract body content without headings (for markdown)
  const removeHeadingsMarkdown = (markdown: string): string => {
    // Remove markdown headings (#, ##, ###, etc.)
    return markdown.replace(/^#+\s+.+$/gm, '').trim();
  };

  // Helper: Extract body content without headings (for HTML)
  const removeHeadingsHtml = (html: string): string => {
    // Remove all heading tags and their content
    return html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, ' ');
  };

  // Helper: Check if text position is inside a heading (markdown)
  const isInHeadingMarkdown = (text: string, position: number): boolean => {
    // Find the line containing this position
    const lines = text.substring(0, position).split('\n');
    const lastLine = lines[lines.length - 1];
    // Check if line starts with # (markdown heading)
    return /^#+\s+/.test(lastLine);
  };

  // Helper: Check if text position is inside an existing markdown link [text](url)
  const isInsideMarkdownLink = (text: string, position: number): boolean => {
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRegex.exec(text)) !== null) {
      if (position >= m.index && position < m.index + m[0].length) {
        return true;
      }
    }
    return false;
  };

  // Helper: Check if text position is inside an existing HTML link <a ...>...</a>
  const isInsideHtmlLink = (html: string, position: number): boolean => {
    const linkRegex = /<a\s[^>]*>.*?<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
      if (position >= m.index && position < m.index + m[0].length) {
        return true;
      }
    }
    return false;
  };

  // Helper: Check if text position is inside a heading (HTML)
  const isInHeadingHtml = (html: string, position: number): boolean => {
    // Find the text before and after position to check if we're inside a heading tag
    const beforeText = html.substring(Math.max(0, position - 100), position);
    const afterText = html.substring(position, Math.min(html.length, position + 100));
    // Check if we have an unclosed opening heading tag before position
    const headingOpen = beforeText.match(/<h[1-6][^>]*>(?!.*<\/h[1-6]>)/i);
    const headingClose = !afterText.match(/^[^<]*<\/h[1-6]>/i);
    return !!(headingOpen && headingClose);
  };

  // Generate AI-powered link suggestions for a section
  const generateAiLinkSuggestions = async (sectionIndex: number, blogsToLink: any[]) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      alert("Invalid section.");
      return;
    }

    const section = sections[sectionIndex];
    if (!section) {
      alert("Section not found.");
      return;
    }

    if (!blogsToLink || blogsToLink.length === 0) {
      alert("No blogs available to suggest links for.");
      return;
    }

    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in to use AI link suggestions.");
      return;
    }

    setLoadingAiSuggestions(true);
    
    try {
      const sectionContent = typeof section.content === 'string' 
        ? section.content 
        : section.contentHtml || '';

      // Fetch full content for relevant blogs (for internal links)
      const enrichedBlogs = await Promise.all(
        blogsToLink.map(async (blog) => {
          if (blog.source === 'local' && !blog.fullContent) {
            // For local blogs, content is already loaded
            return blog;
          } else if (blog.source === 'wix' && !blog.fullContent) {
            // For Wix blogs, fetch full content
            try {
              const response = await fetch(
                `/api/blog/wix-posts?action=details&postId=${blog.wixPostId}`,
                { headers: { Authorization: auth } }
              );
              if (response.ok) {
                const data = await response.json();
                const fullPost = data.post;
                let fullContent = fullPost.content || '';
                if (!fullContent && fullPost.richContent?.nodes) {
                  fullContent = extractTextFromWixNodes(fullPost.richContent.nodes);
                }
                return { ...blog, fullContent };
              }
            } catch (err) {
              console.log("Could not fetch Wix blog content:", err);
            }
          }
          return blog;
        })
      );

      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/generate-links",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
          },
          body: JSON.stringify({
            sectionContent,
            sectionTitle: section.title,
            blogs: enrichedBlogs,
            linkType: "internal",
          }),
        },
        1
      );

      if (response.ok && data.success) {
        setAiLinkSuggestions(data.suggestions || []);
        setShowAiLinkModal(true);
        
        if (data.suggestions.length === 0) {
          alert("No suitable link insertion points found. You can still manually add links.");
        }
      } else {
        const error = data?.error || "Failed to generate AI suggestions";
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Failed to generate AI link suggestions:", error);
      alert(`Error generating suggestions: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  // Apply an AI suggestion to insert a link
  const applyAiSuggestion = async (suggestion: any, sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      alert("Invalid section.");
      return;
    }

    const section = sections[sectionIndex];
    const blog = relevantBlogs[suggestion.blogIndex];

    if (!section || !blog) {
      alert("Section or blog not found.");
      return;
    }

    const slug = blog.metadata?.slug || blog.wixSlug || 'blog';
    const blogUrl = `https://www.jordanphysiotherapyayrshire.co.uk/${slug}`;
    const anchorText = suggestion.anchorText;
    const currentContent = typeof section.content === 'string' 
      ? section.content 
      : section.contentHtml || '';
    const sectionIsHtml = !!section.contentHtml;

    // Use AI to rewrite the content and naturally incorporate the link
    const auth = localStorage.getItem("admin_auth") || "";
    try {
      setLoadingAiSuggestions(true);
      
      const response = await fetch("/api/blog/apply-ai-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({
          content: currentContent,
          anchorText: anchorText,
          linkUrl: blogUrl,
          blogTitle: blog.title || blog.topic,
          isHtml: sectionIsHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply link");
      }

      const data = await response.json();
      const rewrittenContent = data.content;

      const updatedSections = [...sections];
      updateSectionContentFromRaw(updatedSections, sectionIndex, rewrittenContent, {
        isHtml: sectionIsHtml,
      });

      setSections(updatedSections);
      setShowAiLinkModal(false);
      alert(`✓ Added link: "${anchorText}" → "${blog.title}"\n\nContent rewritten naturally to incorporate the link.`);
    } catch (error) {
      console.error("Failed to apply AI link suggestion:", error);
      alert(`Error applying link: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  // Generate AI suggestions for swapping/improving external links in a section
  const generateAiExternalSuggestions = async (sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      alert("Invalid section.");
      return;
    }

    const section = sections[sectionIndex];
    if (!section) {
      alert("Section not found.");
      return;
    }

    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in to use AI suggestions.");
      return;
    }

    const contentHtml = getSectionRenderedHtml(section);
    const existingLinks = getExternalSectionLinks(section);

    if (existingLinks.length === 0) {
      alert("No external links found in this section to suggest alternatives for.");
      return;
    }

    setLoadingExternalAiSuggestions(true);

    try {
      const sectionContent = typeof section.content === 'string'
        ? section.content
        : contentHtml;

      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/generate-links",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
          },
          body: JSON.stringify({
            sectionContent,
            sectionTitle: section.title,
            existingLinks,
            researchSources: researchData?.sources || [],
            linkType: "external",
          }),
        },
        1
      );

      if (response.ok && data.success) {
        setAiExternalSuggestions(data.suggestions || []);
        setShowExternalAiModal(true);

        if (data.suggestions.length === 0) {
          alert("AI couldn't find better alternatives for the current external links.");
        }
      } else {
        const error = data?.error || "Failed to generate external link suggestions";
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Failed to generate external AI suggestions:", error);
      alert("An error occurred while generating AI suggestions.");
    } finally {
      setLoadingExternalAiSuggestions(false);
    }
  };

  // Apply an AI external link suggestion (swap old link for new)
  const applyExternalSuggestion = (suggestion: any, sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      alert("Invalid section.");
      return;
    }

    setApplyingExternalSuggestion(true);

    try {
      const updatedSections = [...sections];
      const section = updatedSections[sectionIndex];

      if (suggestion.action === 'replace' && suggestion.oldUrl && suggestion.newUrl) {
        // Replace old URL with new URL in content
        if (section.contentHtml) {
          // Replace in HTML — update href and anchor text
          const oldUrlEscaped = suggestion.oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkRegex = new RegExp(`(<a\\s+[^>]*href=["'])${oldUrlEscaped}(["'][^>]*>)([^<]*)(</a>)`, 'gi');
          section.contentHtml = section.contentHtml.replace(
            linkRegex,
            `$1${suggestion.newUrl}$2${suggestion.newAnchorText || '$3'}$4`
          );
        }

        if (typeof section.content === 'string') {
          // Replace in markdown
          const oldUrlEscaped = suggestion.oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const mdLinkRegex = new RegExp(`\\[([^\\]]*)\\]\\(${oldUrlEscaped}\\)`, 'gi');
          section.content = section.content.replace(
            mdLinkRegex,
            `[${suggestion.newAnchorText || '$1'}](${suggestion.newUrl})`
          );
        } else if (section.content?.nodes) {
          // Replace in ricos nodes
          const updateRicosLinks = (nodes: any[]) => {
            for (const node of nodes) {
              if (node.type === 'link' && node.href === suggestion.oldUrl) {
                node.href = suggestion.newUrl;
                if (suggestion.newAnchorText && node.nodes?.[0]) {
                  node.nodes[0].data = suggestion.newAnchorText;
                }
              }
              if (node.nodes) updateRicosLinks(node.nodes);
            }
          };
          updateRicosLinks(section.content.nodes);
        }
      } else if (suggestion.action === 'remove' && suggestion.oldUrl) {
        // Remove the link but keep the text
        if (section.contentHtml) {
          const oldUrlEscaped = suggestion.oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkRegex = new RegExp(`<a\\s+[^>]*href=["']${oldUrlEscaped}["'][^>]*>([^<]*)</a>`, 'gi');
          section.contentHtml = section.contentHtml.replace(linkRegex, '$1');
        }

        if (typeof section.content === 'string') {
          const oldUrlEscaped = suggestion.oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const mdLinkRegex = new RegExp(`\\[([^\\]]*)\\]\\(${oldUrlEscaped}\\)`, 'gi');
          section.content = section.content.replace(mdLinkRegex, '$1');
        }
      } else if (suggestion.action === 'add' && suggestion.newUrl && suggestion.newAnchorText) {
        // Add a new external link
        const linkHtml = `<a href="${suggestion.newUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;text-decoration:underline;">${suggestion.newAnchorText}</a>`;

        if (section.contentHtml) {
          // Try to find anchor text in content and wrap it
          const anchorEscaped = suggestion.newAnchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${anchorEscaped}\\b`, 'gi');
          const matches = [...section.contentHtml.matchAll(regex)];
          let inserted = false;
          for (const match of matches) {
            const pos = match.index || 0;
            if (!isInHeadingHtml(section.contentHtml, pos) && !isInsideHtmlLink(section.contentHtml, pos)) {
              section.contentHtml = section.contentHtml.substring(0, pos) + linkHtml + section.contentHtml.substring(pos + match[0].length);
              inserted = true;
              break;
            }
          }
          if (!inserted) {
            section.contentHtml += `<p>${linkHtml}</p>`;
          }
        }
      }

      const syncUsesHtml = typeof section.content !== 'string';
      const syncSource = syncUsesHtml
        ? section.contentHtml || ''
        : section.content;
      updateSectionContentFromRaw(updatedSections, sectionIndex, syncSource, {
        isHtml: syncUsesHtml,
      });

      setSections(updatedSections);
      setSelectedExternalSuggestion(null);

      // Remove applied suggestion from list
      setAiExternalSuggestions(prev => prev.filter((_, i) => {
        const idx = prev.indexOf(suggestion);
        return i !== idx;
      }));

      const actionLabel = suggestion.action === 'replace' ? 'Replaced' : suggestion.action === 'remove' ? 'Removed' : 'Added';
      alert(`✓ ${actionLabel} external link successfully.`);
    } catch (error) {
      console.error("Failed to apply external suggestion:", error);
      alert("Error applying suggestion.");
    } finally {
      setApplyingExternalSuggestion(false);
    }
  };

  const insertBlogLink = (blog: any) => {
    if (!selectedDraft || expandedSectionIndex === null || expandedSectionIndex >= sections.length) {
      alert("No section selected. Please open a section first.");
      return;
    }

    const currentSection = sections[expandedSectionIndex];
    if (!currentSection) {
      alert("Current section not found.");
      return;
    }

    // Check if link limit is reached
    const currentLinkCount = countInternalLinksInSection(expandedSectionIndex);
    if (currentLinkCount >= internalLinksPerSection) {
      alert(`Link limit reached for this section (${internalLinksPerSection} max). No more internal links can be added.`);
      return;
    }

    const slug = blog.metadata?.slug || blog.wixSlug || 'blog';
    const blogUrl = `https://www.jordanphysiotherapyayrshire.co.uk/${slug}`;
    const blogTitle = blog.title || blog.topic || 'Read more';
    
    // Get the section content
    const content = typeof currentSection.content === 'string' 
      ? currentSection.content 
      : currentSection.contentHtml || '';

    // Remove headings from content to search in body only
    const bodyContentForSearch = typeof currentSection.content === 'string'
      ? removeHeadingsMarkdown(content)
      : removeHeadingsHtml(content);

    // Pick concise, descriptive, natural anchor text (≤5 words, not generic)
    const anchorText = pickAnchorText(blog, bodyContentForSearch);
    let insertedLink = false;

    // Insert link naturally into content
    const updatedSections = [...sections];
    const linkMarkdown = `[${anchorText}](${blogUrl})`;
    const linkHtml = `<a href="${blogUrl}" target="_blank">${anchorText}</a>`;

    if (typeof currentSection.content === 'string') {
      // For markdown, find the anchor text and wrap it (avoiding headings & existing links)
      const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = [...updatedSections[expandedSectionIndex].content.matchAll(regex)];
      
      // Find first match that's NOT in a heading and NOT inside an existing link
      for (const match of matches) {
        const pos = match.index || 0;
        if (!isInHeadingMarkdown(updatedSections[expandedSectionIndex].content, pos) &&
            !isInsideMarkdownLink(updatedSections[expandedSectionIndex].content, pos)) {
          updatedSections[expandedSectionIndex].content = 
            updatedSections[expandedSectionIndex].content.substring(0, pos) +
            linkMarkdown +
            updatedSections[expandedSectionIndex].content.substring(pos + match[0].length);
          insertedLink = true;
          break;
        }
      }
    } else if (currentSection.contentHtml) {
      // For HTML content, wrap in natural anchor tag (avoiding headings & existing links)
      const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = [...updatedSections[expandedSectionIndex].contentHtml.matchAll(regex)];
      
      // Find first match that's NOT in a heading and NOT inside an existing link
      for (const match of matches) {
        const pos = match.index || 0;
        if (!isInHeadingHtml(updatedSections[expandedSectionIndex].contentHtml, pos) &&
            !isInsideHtmlLink(updatedSections[expandedSectionIndex].contentHtml, pos)) {
          updatedSections[expandedSectionIndex].contentHtml = 
            updatedSections[expandedSectionIndex].contentHtml.substring(0, pos) +
            linkHtml +
            updatedSections[expandedSectionIndex].contentHtml.substring(pos + match[0].length);
          insertedLink = true;
          break;
        }
      }
    }

    if (!insertedLink) {
      alert(`Could not find anchor text in body content (avoided headings). Appending: "${blogTitle}"`);
      // Fallback: append at end
      if (typeof currentSection.content === 'string') {
        updatedSections[expandedSectionIndex].content += `\n\n[${blogTitle}](${blogUrl})`;
      } else {
        updatedSections[expandedSectionIndex].contentHtml += `<p><a href="${blogUrl}" target="_blank">${blogTitle}</a></p>`;
      }
    }

    const syncUsesHtml = typeof updatedSections[expandedSectionIndex].content !== 'string';
    const syncSource = syncUsesHtml
      ? updatedSections[expandedSectionIndex].contentHtml || ''
      : updatedSections[expandedSectionIndex].content;
    updateSectionContentFromRaw(
      updatedSections,
      expandedSectionIndex,
      syncSource,
      { isHtml: syncUsesHtml }
    );

    setSections(updatedSections);
    const remainingSlots = internalLinksPerSection - (currentLinkCount + 1);
    alert(`✓ Linked "${anchorText}" to "${blogTitle}"`);
  };

  // Batch insert top N relevant links (for a specific section, not current)
  const insertTopLinksToSection = (sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      alert("Invalid section.");
      return;
    }

    const section = sections[sectionIndex];
    if (!section) {
      alert("Section not found.");
      return;
    }

    if (relevantBlogs.length === 0) {
      alert("No relevant blogs available to insert.");
      return;
    }

    const currentLinkCount = countInternalLinksInSection(sectionIndex);
    const slotsAvailable = internalLinksPerSection - currentLinkCount;

    if (slotsAvailable <= 0) {
      alert(`Link limit reached for this section (${internalLinksPerSection} max).`);
      return;
    }

    // How many links to insert (up to available slots, or all relevant blogs, whichever is smaller)
    const linksToInsert = Math.min(slotsAvailable, relevantBlogs.length);
    const updatedSections = [...sections];
    const targetSection = updatedSections[sectionIndex];
    const sectionContent = typeof targetSection.content === 'string' 
      ? targetSection.content 
      : targetSection.contentHtml || '';
    
    // Remove headings from content to search in body only
    const bodyContentForSearch = typeof targetSection.content === 'string'
      ? removeHeadingsMarkdown(sectionContent)
      : removeHeadingsHtml(sectionContent);
    
    let addedCount = 0;

    for (let i = 0; i < linksToInsert; i++) {
      const blog = relevantBlogs[i];
      const slug = blog.metadata?.slug || blog.wixSlug || 'blog';
      const blogUrl = `https://www.jordanphysiotherapyayrshire.co.uk/${slug}`;
      const blogTitle = blog.title || blog.topic || 'Read more';

      // Pick concise, descriptive, natural anchor text (≤5 words, not generic)
      const anchorText = pickAnchorText(blog, bodyContentForSearch);

      const linkMarkdown = `[${anchorText}](${blogUrl})`;
      const linkHtml = `<a href="${blogUrl}" target="_blank">${anchorText}</a>`;

      if (typeof targetSection.content === 'string') {
        // Try to insert naturally in non-heading content, fallback to append
        const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = [...targetSection.content.matchAll(regex)];
        let inserted = false;
        
        // Find first match that's NOT in a heading and NOT inside an existing link
        for (const match of matches) {
          const pos = match.index || 0;
          if (!isInHeadingMarkdown(targetSection.content, pos) &&
              !isInsideMarkdownLink(targetSection.content, pos)) {
            targetSection.content = 
              targetSection.content.substring(0, pos) +
              linkMarkdown +
              targetSection.content.substring(pos + match[0].length);
            inserted = true;
            break;
          }
        }
        
        if (!inserted) {
          // Fallback: append at end
          if (i === 0 || !targetSection.content.includes('\n\n')) {
            targetSection.content += `\n\n`;
          } else {
            targetSection.content += ` `;
          }
          targetSection.content += linkMarkdown;
        }
      } else if (targetSection.contentHtml) {
        // For HTML, try to find and wrap the phrase (avoiding headings & existing links)
        const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = [...targetSection.contentHtml.matchAll(regex)];
        let inserted = false;
        
        // Find first match that's NOT in a heading and NOT inside an existing link
        for (const match of matches) {
          const pos = match.index || 0;
          if (!isInHeadingHtml(targetSection.contentHtml, pos) &&
              !isInsideHtmlLink(targetSection.contentHtml, pos)) {
            targetSection.contentHtml = 
              targetSection.contentHtml.substring(0, pos) +
              linkHtml +
              targetSection.contentHtml.substring(pos + match[0].length);
            inserted = true;
            break;
          }
        }
        
        if (!inserted) {
          // Fallback: append at end
          targetSection.contentHtml += `<p><a href="${blogUrl}" target="_blank">${blogTitle}</a></p>`;
        }
      }
      addedCount++;
    }

    const syncUsesHtml = typeof targetSection.content !== 'string';
    const syncSource = syncUsesHtml
      ? targetSection.contentHtml || ''
      : targetSection.content;
    updateSectionContentFromRaw(updatedSections, sectionIndex, syncSource, {
      isHtml: syncUsesHtml,
    });

    setSections(updatedSections);
    const newLinkCount = currentLinkCount + addedCount;
    const remainingSlots = internalLinksPerSection - newLinkCount;
    alert(`✓ Added ${addedCount} internal link${addedCount !== 1 ? 's' : ''} to "${section.title}"\n\n${remainingSlots > 0 ? `This section can have ${remainingSlots} more link${remainingSlots !== 1 ? 's' : ''}.` : 'This section has reached its link limit.'}`);
  };

  // Auto-insert top N relevant links after section is written
  const autoInsertTopLinks = (sectionIndex: number) => {
    if (!relevantBlogs.length || internalLinksPerSection <= 0 || sectionIndex >= sections.length) {
      return;
    }

    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];

    if (!section) return;

    const linksToInsert = Math.min(internalLinksPerSection, relevantBlogs.length);
    const sectionContent = typeof section.content === 'string' 
      ? section.content 
      : section.contentHtml || '';

    // Remove headings from content to search in body only
    const bodyContentForSearch = typeof section.content === 'string'
      ? removeHeadingsMarkdown(sectionContent)
      : removeHeadingsHtml(sectionContent);

    for (let i = 0; i < linksToInsert; i++) {
      const blog = relevantBlogs[i];
      const slug = blog.metadata?.slug || blog.wixSlug || 'blog';
      const blogUrl = `https://www.jordanphysiotherapyayrshire.co.uk/${slug}`;
      const blogTitle = blog.title || blog.topic || 'Read more';

      // Pick concise, descriptive, natural anchor text (≤5 words, not generic)
      const anchorText = pickAnchorText(blog, bodyContentForSearch);

      const linkMarkdown = `[${anchorText}](${blogUrl})`;
      const linkHtml = `<a href="${blogUrl}" target="_blank">${anchorText}</a>`;

      if (typeof section.content === 'string') {
        // Try to insert naturally in non-heading content, fallback to append
        const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = [...section.content.matchAll(regex)];
        let inserted = false;
        
        // Find first match that's NOT in a heading and NOT inside an existing link
        for (const match of matches) {
          const pos = match.index || 0;
          if (!isInHeadingMarkdown(section.content, pos) &&
              !isInsideMarkdownLink(section.content, pos)) {
            section.content = 
              section.content.substring(0, pos) +
              linkMarkdown +
              section.content.substring(pos + match[0].length);
            inserted = true;
            break;
          }
        }
        
        if (!inserted) {
          // Fallback: append at end
          section.content += `\n\n${linkMarkdown}`;
        }
      } else if (section.contentHtml) {
        // For HTML, try to find and wrap (avoiding headings & existing links)
        const regex = new RegExp(`\\b${anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = [...section.contentHtml.matchAll(regex)];
        let inserted = false;
        
        // Find first match that's NOT in a heading and NOT inside an existing link
        for (const match of matches) {
          const pos = match.index || 0;
          if (!isInHeadingHtml(section.contentHtml, pos) &&
              !isInsideHtmlLink(section.contentHtml, pos)) {
            section.contentHtml = 
              section.contentHtml.substring(0, pos) +
              linkHtml +
              section.contentHtml.substring(pos + match[0].length);
            inserted = true;
            break;
          }
        }
        
        if (!inserted) {
          // Fallback: append at end
          section.contentHtml += `<p><a href="${blogUrl}" target="_blank">${blogTitle}</a></p>`;
        }
      }
    }

    const syncUsesHtml = typeof section.content !== 'string';
    const syncSource = syncUsesHtml
      ? section.contentHtml || ''
      : section.content;
    updateSectionContentFromRaw(updatedSections, sectionIndex, syncSource, {
      isHtml: syncUsesHtml,
    });

    setSections(updatedSections);
    console.log(`[Auto-Insert] Added ${linksToInsert} internal links to section ${sectionIndex}`);
  };

  const filterRelevantBlogs = (sectionTitle: string, sectionContent: string) => {
    if (!publishedBlogs || publishedBlogs.length === 0) {
      setRelevantBlogs([]);
      return;
    }

    // Extract keywords from current section
    const keywords = new Set<string>();
    
    // Add section title words (longer than 3 chars) - THIS IS MOST IMPORTANT
    const titleWords = sectionTitle.toLowerCase().split(/[\s\-,]+/).filter(w => w.length > 3);
    titleWords.forEach(word => {
      if (!['that', 'this', 'from', 'with', 'have', 'your', 'will'].includes(word)) {
        keywords.add(word);
      }
    });
    
    // Add common bigrams from title (e.g., "shoulder pain" as a phrase)
    for (let i = 0; i < titleWords.length - 1; i++) {
      const bigram = `${titleWords[i]} ${titleWords[i + 1]}`.toLowerCase();
      if (bigram.length > 8) {
        keywords.add(bigram);
      }
    }
    
    // Extract important terms from content if available
    if (sectionContent && sectionContent.length > 20) {
      // Capitalized terms (proper nouns, medical terms)
      const medicalTerms = sectionContent.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) || [];
      medicalTerms.forEach(term => {
        const lower = term.toLowerCase();
        if (lower.length > 3) {
          keywords.add(lower);
        }
      });
      
      // Common therapy/medical terms
      const commonTerms = sectionContent.toLowerCase().match(/\b(therapy|exercise|pain|treatment|rehabilitation|stretch|muscle|movement|recovery|healing|physiotherapy|physical therapy|fitness|strength|flexibility|injury|condition|symptoms|relief|function|therapy|technique|method|approach)\b/g) || [];
      commonTerms.forEach(term => {
        keywords.add(term);
      });
    }

    console.log('[Filter] Section:', sectionTitle, 'Keywords:', Array.from(keywords).slice(0, 5));

    // Score published blogs based on keyword overlap
    const scoredBlogs = publishedBlogs.map(blog => {
      let score = 0;
      const blogText = blog.allText || `${blog.topic} ${blog.metadata?.title} ${blog.metadata?.excerpt}`.toLowerCase();
      
      // Check each keyword - weight by match type
      keywords.forEach(keyword => {
        // Exact phrase match gets highest score
        if (blogText.includes(keyword)) {
          const count = (blogText.match(new RegExp(keyword, 'g')) || []).length;
          score += (count * (keyword.split(' ').length > 1 ? 10 : 3));
        }
      });
      
      // Strong boost if section title matches blog title/topic closely (even partial match)
      const sectionLower = sectionTitle.toLowerCase();
      const blogLower = blog.topic.toLowerCase();
      if (sectionLower === blogLower || 
          sectionLower.includes(blogLower) || 
          blogLower.includes(sectionLower)) {
        score += 20; // Big boost for topic match
      }
      
      // Moderate boost for partial overlap
      const sectionWords = sectionLower.split(/\s+/);
      const blogWords = blogLower.split(/\s+/);
      const overlapCount = sectionWords.filter(w => blogLower.includes(w)).length;
      if (overlapCount > 0) {
        score += overlapCount * 2;
      }

      return {
        ...blog,
        relevanceScore: score
      };
    });

    // Return blogs sorted by relevance, show only those with actual relevance matches
    // Filter out blogs with 0 relevance score - only show truly relevant ones
    const relevant = scoredBlogs
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .filter(blog => (blog.relevanceScore || 0) > 0)
      .slice(0, 5);

    console.log('[Filter] Found', relevant.length, 'relevant blogs. Top scores:', relevant.map(b => `${b.topic} (${b.relevanceScore})`).slice(0, 3));
    setRelevantBlogs(relevant);
  };

  // Check if authenticated
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth) {
      setAuthenticated(true);
      loadDrafts(auth);
    }
  }, []);

  // Initialize custom image prompt from localStorage or use default
  useEffect(() => {
    const saved = localStorage.getItem("blog_image_prompt");
    setCustomImagePrompt(saved || DEFAULT_IMAGE_PROMPT_TEMPLATE);
  }, []);

  // Restore create-form progress when returning to the page.
  useEffect(() => {
    const snapshot = parseCreateFormAutosave(
      localStorage.getItem(CREATE_FORM_AUTOSAVE_KEY)
    );
    if (!snapshot) return;

    setNewLocation(snapshot.newLocation || "");
    setNewTopic(snapshot.newTopic || "");
    setNewSport(snapshot.newSport || "");
    setNumSections(
      Number.isFinite(snapshot.numSections)
        ? Math.min(Math.max(snapshot.numSections, 3), 10)
        : 5
    );
    setIncludeChecklist(snapshot.includeChecklist !== false);
    setIncludeFaq(snapshot.includeFaq !== false);
    setIncludeInternalCta(snapshot.includeInternalCta !== false);
    setIncludeOverview(snapshot.includeOverview !== false);
    setIncludeAuthorTakeaway(snapshot.includeAuthorTakeaway === true);
    setAuthorTakeawayText(snapshot.authorTakeawayText || "");
  }, []);

  // Persist create-form progress continuously.
  useEffect(() => {
    const payload: CreateFormAutosaveSnapshot = {
      newLocation,
      newTopic,
      newSport,
      numSections,
      includeChecklist,
      includeFaq,
      includeInternalCta,
      includeOverview,
      includeAuthorTakeaway,
      authorTakeawayText,
    };

    localStorage.setItem(CREATE_FORM_AUTOSAVE_KEY, JSON.stringify(payload));
  }, [
    newLocation,
    newTopic,
    newSport,
    numSections,
    includeChecklist,
    includeFaq,
    includeInternalCta,
    includeOverview,
    includeAuthorTakeaway,
    authorTakeawayText,
  ]);

  // Persist in-progress editor work for the active draft.
  useEffect(() => {
    if (!selectedDraft?.id || activeTab !== "edit") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const payload: DraftAutosaveSnapshot = {
        draftId: selectedDraft.id,
        updatedAt: new Date().toISOString(),
        sections,
        outline,
        editableOutline,
        sectionTargetWords,
        currentSectionIndex,
        researchData,
        selectedSourceIds,
        editableDraftLocation,
        editableDraftTopic,
        editableDraftSport,
        editableTitle,
        editableSlug,
        editableExcerpt,
        editableSeoTitle,
        editableSeoDescription,
        editableFeaturedImageUrl,
        editableContent,
        includeChecklist: selectedDraft.includeChecklist !== false,
        includeFaq: selectedDraft.includeFaq !== false,
        includeInternalCta: selectedDraft.includeInternalCta !== false,
        includeOverview: selectedDraft.includeOverview !== false,
        includeAuthorTakeaway: selectedDraft.includeAuthorTakeaway === true,
        authorTakeawayText: selectedDraft.authorTakeawayText || "",
      };

      localStorage.setItem(
        getDraftAutosaveKey(selectedDraft.id),
        JSON.stringify(payload)
      );
      setLastLocalAutosaveAt(payload.updatedAt);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [
    selectedDraft?.id,
    selectedDraft?.includeChecklist,
    selectedDraft?.includeFaq,
    selectedDraft?.includeInternalCta,
    selectedDraft?.includeOverview,
    selectedDraft?.includeAuthorTakeaway,
    selectedDraft?.authorTakeawayText,
    activeTab,
    sections,
    outline,
    editableOutline,
    sectionTargetWords,
    currentSectionIndex,
    researchData,
    selectedSourceIds,
    editableDraftLocation,
    editableDraftTopic,
    editableDraftSport,
    editableTitle,
    editableSlug,
    editableExcerpt,
    editableSeoTitle,
    editableSeoDescription,
    editableFeaturedImageUrl,
    editableContent,
  ]);

  useEffect(() => {
    if (!selectedDraft?.id || activeTab !== "edit") {
      return;
    }

    setSelectedDraft((prev) => {
      if (!prev || prev.id !== selectedDraft.id || prev.sections === sections) {
        return prev;
      }

      return {
        ...prev,
        sections,
      };
    });
  }, [activeTab, sections, selectedDraft?.id]);

  useEffect(() => {
    setSelectedDraftIds((prev) =>
      prev.filter((id) => drafts.some((draft) => draft.id === id))
    );
  }, [drafts]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const auth = `Bearer ${password}`;
    localStorage.setItem("admin_auth", auth);
    setAuthenticated(true);
    setPassword("");
    loadDrafts(auth);
  };

  const logout = () => {
    localStorage.removeItem("admin_auth");
    setAuthenticated(false);
    setDrafts([]);
    setSelectedDraft(null);
  };

  const loadDrafts = async (auth: string) => {
    try {
      const response = await fetch("/api/blog/research", {
        headers: { 
          Authorization: auth,
          "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error("Failed to load drafts:", error);
    }
  };

  const deleteDraft = async (draftId: string, topic: string) => {
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in first");
      return;
    }

    const confirmed = window.confirm(
      `Delete draft \"${topic}\"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingDraftId(draftId);

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ draftId }),
        },
        1
      );

      if (!response.ok) {
        const message = data?.error || `HTTP ${response.status}: Failed to delete draft`;
        alert(message);
        return;
      }

      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
      setSelectedDraftIds((prev) => prev.filter((id) => id !== draftId));
      clearDraftAutosave(draftId);

      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null);
        setActiveTab("list");
      }
    } catch (error) {
      console.error("Failed to delete draft:", error);
      alert(error instanceof Error ? error.message : "Failed to delete draft");
    } finally {
      setDeletingDraftId(null);
    }
  };

  const toggleDraftSelection = (draftId: string) => {
    setSelectedDraftIds((prev) =>
      prev.includes(draftId)
        ? prev.filter((id) => id !== draftId)
        : [...prev, draftId]
    );
  };

  const toggleSelectAllDrafts = () => {
    if (selectedDraftIds.length === drafts.length) {
      setSelectedDraftIds([]);
      return;
    }
    setSelectedDraftIds(drafts.map((draft) => draft.id));
  };

  const deleteMultipleDrafts = async (draftIds: string[], prompt: string) => {
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in first");
      return;
    }

    if (draftIds.length === 0) {
      alert("No drafts selected.");
      return;
    }

    const confirmed = window.confirm(prompt);
    if (!confirmed) {
      return;
    }

    setBulkDeleting(true);

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/draft",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ draftIds }),
        },
        1
      );

      if (!response.ok) {
        const message = data?.error || `HTTP ${response.status}: Failed to delete drafts`;
        alert(message);
        return;
      }

      const deletedIds: string[] = Array.isArray(data?.deletedIds)
        ? data.deletedIds
        : draftIds;

      for (const id of deletedIds) {
        clearDraftAutosave(id);
      }

      setDrafts((prev) => prev.filter((draft) => !deletedIds.includes(draft.id)));
      setSelectedDraftIds((prev) => prev.filter((id) => !deletedIds.includes(id)));

      if (selectedDraft && deletedIds.includes(selectedDraft.id)) {
        setSelectedDraft(null);
        setActiveTab("list");
      }
    } catch (error) {
      console.error("Failed to delete drafts:", error);
      alert(error instanceof Error ? error.message : "Failed to delete drafts");
    } finally {
      setBulkDeleting(false);
    }
  };

  const deleteSelectedDrafts = async () => {
    await deleteMultipleDrafts(
      selectedDraftIds,
      `Delete ${selectedDraftIds.length} selected draft(s)? This cannot be undone.`
    );
  };

  const deleteAllDrafts = async () => {
    await deleteMultipleDrafts(
      drafts.map((draft) => draft.id),
      `Delete all ${drafts.length} draft(s)? This cannot be undone.`
    );
  };

  const loadWixPublishedPosts = async () => {
    setLoadingWixPosts(true);
    const auth = localStorage.getItem("admin_auth") || "";
    
    try {
      const response = await fetch("/api/blog/wix-posts", {
        headers: { Authorization: auth },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWixPosts(data.posts || []);
        setShowWixPostsModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || `HTTP ${response.status}`;
        console.error("Wix API error:", errorMsg);
        alert(`Failed to load Wix posts: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to load Wix posts:", error);
      alert(`Error loading Wix posts: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoadingWixPosts(false);
    }
  };

  const loadWixPostToEdit = async (postId: string) => {
    const auth = localStorage.getItem("admin_auth") || "";
    setLoading(true);
    
    // Declare stored variables at function scope
    let storedMetadata: any = {};
    let storedResearchData: any = null;
    let storedSectionsWithImages: any[] = [];
    let storedFeaturedImageUrl: string | undefined;
    
    try {
      const response = await fetch(`/api/blog/wix-posts?action=details&postId=${postId}`, {
        headers: { Authorization: auth },
      });
      
      if (response.ok) {
        const data = await response.json();
        const wixPost = data.post;
        
        console.log("[Admin] Loaded Wix post:", {
          id: wixPost.id,
          title: wixPost.title,
          hasRichContent: !!wixPost.richContent,
          richContentType: typeof wixPost.richContent,
        });
        
        // ⚠️ NOTE: Published posts from Wix API have 'contentText' (plain text) not 'richContent'
        // The richContent structure will be generated from contentText for editing purposes
        if (!wixPost.richContent) {
          // This is expected for published posts - richContent is for drafts
          console.log("[Admin] Post has no richContent (normal for published posts)");
        }
        
        // Extract outline (all H2 headings) from rich content
        const extractedOutline = extractOutlineFromRichContent(wixPost.richContent || {});
        
        // Parse rich content into proper sections
        const parsedSections = parseWixRichContentToSections(wixPost.richContent || {});
        
        // Extract metadata
        const metadata = {
          wixPostId: postId,
          wixSlug: wixPost.slug,
          seoTitle: wixPost.seoData?.title,
          seoDescription: wixPost.seoData?.description,
          category: wixPost.category,
          featured: wixPost.featured,
          originalUrl: wixPost.url,
        };
        
        // Extract keywords from SEO data
        const keywords = extractKeywordsFromText(
          wixPost.seoData?.description || wixPost.title || ""
        );
        
        // Use stored research data if available, otherwise create from sections
        let mockResearchData: ResearchData;
        if (storedResearchData && storedResearchData.sources && storedResearchData.sources.length > 0) {
          // Use recovered original sources with their proper metadata
          mockResearchData = storedResearchData;
          console.log("[Admin] Using recovered research data with", storedResearchData.sources.length, "sources");
        } else {
          // Fallback: create from sections (for old blogs without stored data)
          const researchSources = parsedSections.map((section: any, idx: number) => ({
            title: section.title,
            content: extractTextFromWixNodes(section.content?.nodes || []),
            contentHtml: section.contentHtml,
            source: wixPost.title || "Published blog",
            url: `${wixPost.url}#${idx}`,
            relevanceScore: 1,
            excerpt: section.contentHtml?.replace(/<[^>]*>/g, "").substring(0, 200) || "",
            category: wixPost.category,
            keywords: keywords,
            bodyContent: extractTextFromWixNodes(section.content?.nodes || []),
          }));
          
          mockResearchData = {
            sources: researchSources,
            keywords: keywords,
          };
        }
        
        // Retrieve stored data: research sources, metadata, images
        try {
          const storedResponse = await fetch(`/api/blog/published-post?postId=${postId}`, {
            headers: { Authorization: auth },
          });
          if (storedResponse.ok) {
            const storedData = await storedResponse.json();
            const stored = storedData.stored;
            storedMetadata = stored?.metadata || {};
            storedResearchData = stored?.researchData; // Original sources with metadata
            storedSectionsWithImages = stored?.sectionsWithImages || []; // Sections with images
            storedFeaturedImageUrl = stored?.featuredImageUrl;
            console.log("[Admin] Retrieved stored data - sources:", storedResearchData?.sources?.length, "images:", storedSectionsWithImages.length);
          }
        } catch (e) {
          console.log("[Admin] Could not retrieve stored data:", e);
        }
        
        // Map stored images back to sections if available
        if (storedSectionsWithImages && storedSectionsWithImages.length > 0) {
          parsedSections.forEach((section: any, idx: number) => {
            if (storedSectionsWithImages[idx]?.imageUrl) {
              section.imageUrl = storedSectionsWithImages[idx].imageUrl;
            }
          });
        }
        
        // Create draft with full recovered data including extras
        const newDraft: BlogDraft = {
          id: `wix-${postId}`,
          topic: wixPost.title || "",
          status: "writing",
          sections: parsedSections,
          metadata: {
            ...metadata,
            ...storedMetadata, // Include FAQs, checklist, outboundLinks from storage
          },
          selectedSourceIds: mockResearchData.sources.map((source: any, idx: number) =>
            buildSourceId(source, idx)
          ),
          researchData: mockResearchData,
          includeChecklist: true,
          includeFaq: true,
          includeInternalCta: true,
          includeOverview: true,
          includeAuthorTakeaway: true,
          authorTakeawayText: "",
          createdAt: wixPost.createdDate || new Date().toISOString(),
        };
        
        console.log("[Admin] Loaded post with extras:", {
          hasFAQs: !!storedMetadata.faqs,
          hasChecklist: !!storedMetadata.checklist,
          hasLinks: !!storedMetadata.outboundLinks,
        });
        
        // Set all editor state
        setSelectedDraft(newDraft);
        setIncludeChecklist(newDraft.includeChecklist !== false);
        setIncludeFaq(newDraft.includeFaq !== false);
        setIncludeInternalCta(newDraft.includeInternalCta !== false);
        setIncludeOverview(newDraft.includeOverview !== false);
        setIncludeAuthorTakeaway(newDraft.includeAuthorTakeaway === true);
        setAuthorTakeawayText(newDraft.authorTakeawayText || "");
        setEditableDraftTopic(wixPost.title || "");
        setEditableDraftLocation("");
        setEditableDraftSport("");
        setSections(parsedSections);
        setOutline(extractedOutline);
        setEditableOutline(extractedOutline);
        setSectionTargetWords(parsedSections.map((s: any) => s.wordCount || 300));
        setResearchData(mockResearchData);
        
        // Set metadata fields
        setEditableTitle(wixPost.title || "");
        setEditableSlug(wixPost.slug || "");
        setEditableExcerpt(wixPost.excerpt || "");
        setEditableSeoTitle(wixPost.seoData?.title || "");
        setEditableSeoDescription(wixPost.seoData?.description || "");
        
        // Set featured image if recovered
        if (storedFeaturedImageUrl) {
          setEditableFeaturedImageUrl(storedFeaturedImageUrl);
        }
        
        // Also set assembledBlog with recovered metadata so extras are available
        setAssembledBlog({
          metadata: storedMetadata, // FAQs, checklist, outboundLinks
        });
        
        setShowWixPostsModal(false);
        setActiveTab("edit");
      } else {
        alert("Failed to load Wix post details");
      }
    } catch (error) {
      console.error("Failed to load Wix post:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Error loading Wix post: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extract outline (H2 headings) from richContent
   */
  const extractOutlineFromRichContent = (richContent: any): string[] => {
    if (!richContent || !richContent.nodes) {
      return [];
    }

    const outline: string[] = [];
    for (const node of richContent.nodes) {
      if (node.type === "HEADING" && node.headingData?.level === 2) {
        const heading = extractTextFromWixNodes(node.nodes);
        if (heading) {
          outline.push(heading);
        }
      }
    }
    return outline;
  };

  /**
   * Extract keywords from text
   */
  const extractKeywordsFromText = (text: string): string[] => {
    const words = text
      .toLowerCase()
      .split(/[\s,;:\.!?]+/)
      .filter(w => w.length > 3);
    
    // Return unique words, prioritize longer/more specific ones
    const unique = Array.from(new Set(words));
    return unique.slice(0, 10);
  };

  /**
   * Extract plain text from Wix rich text nodes
   */
  const extractTextFromWixNodes = (nodes: any[] = []): string => {
    let text = "";
    for (const node of nodes) {
      if (node.type === "TEXT" && node.textData?.text) {
        text += node.textData.text;
      } else if (node.type === "PARAGRAPH" && node.nodes) {
        text += extractTextFromWixNodes(node.nodes) + " ";
      } else if (node.nodes) {
        text += extractTextFromWixNodes(node.nodes) + " ";
      }
    }
    return text.trim();
  };

  /**
   * Extract plain text from HTML content
   */
  const extractTextFromHtml = (html: string): string => {
    if (!html) return '';
    
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Convert common HTML tags to text with spacing
    text = text.replace(/<p[^>]*>/gi, '\n\n');
    text = text.replace(/<\/p>/gi, '');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '\n');
    text = text.replace(/<\/div>/gi, '');
    text = text.replace(/<h[1-6][^>]*>/gi, '\n### ');
    text = text.replace(/<\/h[1-6]>/gi, '\n');
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '');
    text = text.replace(/<ul[^>]*>|<\/ul>/gi, '');
    text = text.replace(/<ol[^>]*>|<\/ol>/gi, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/&lt;/gi, '<');
    text = text.replace(/&gt;/gi, '>');
    text = text.replace(/&quot;/gi, "\"");
    text = text.replace(/&#39;/gi, "'");
    text = text.replace(/&amp;/gi, '&');
    
    // Remove any remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Clean up whitespace
    text = text.replace(/\n\n+/g, '\n\n').trim();
    
    return text;
  };

  /**
   * Parse Wix richContent into our section format with FULL content visible
   */
  const parseWixRichContentToSections = (richContent: any): any[] => {
    if (!richContent || !richContent.nodes) {
      return [];
    }

    const sections: any[] = [];
    let currentSection: any = null;
    let currentNodes: any[] = [];
    let sectionCount = 0;

    for (const node of richContent.nodes) {
      // H2 headings mark section boundaries
      if (node.type === "HEADING" && node.headingData?.level === 2) {
        // Save previous section
        if (currentSection && currentNodes.length > 0) {
          currentSection.content = {
            nodes: currentNodes,
          };
          currentSection.contentHtml = generateHtmlFromWixNodes(currentNodes);
          currentSection.wordCount = countWordsInNodes(currentNodes);
          sections.push(currentSection);
        }

        // Start new section with heading as title
        const sectionTitle = extractTextFromWixNodes(node.nodes);
        currentSection = {
          title: sectionTitle,
          content: { nodes: [] },
          contentHtml: "",
          wordCount: 0,
        };
        currentNodes = [];
        sectionCount++;
      } else if (node.type === "HEADING" && node.headingData?.level === 3) {
        // H3 headings go into content as subheadings
        if (!currentSection) {
          currentSection = {
            title: `Section ${sectionCount + 1}`,
            content: { nodes: [] },
            contentHtml: "",
            wordCount: 0,
          };
          sectionCount++;
        }
        currentNodes.push(node);
      } else if (node.type === "PARAGRAPH") {
        // Paragraphs, images, lists go into content
        if (!currentSection) {
          currentSection = {
            title: `Section ${sectionCount + 1}`,
            content: { nodes: [] },
            contentHtml: "",
            wordCount: 0,
          };
          sectionCount++;
        }
        currentNodes.push(node);
      } else if (node.type === "IMAGE" || node.type === "BULLETED_LIST" || node.type === "NUMBERED_LIST") {
        // Keep images and lists in content
        if (!currentSection) {
          currentSection = {
            title: `Section ${sectionCount + 1}`,
            content: { nodes: [] },
            contentHtml: "",
            wordCount: 0,
          };
          sectionCount++;
        }
        currentNodes.push(node);
      }
    }

    // Save last section
    if (currentSection && currentNodes.length > 0) {
      currentSection.content = {
        nodes: currentNodes,
      };
      currentSection.contentHtml = generateHtmlFromWixNodes(currentNodes);
      currentSection.wordCount = countWordsInNodes(currentNodes);
      sections.push(currentSection);
    }

    return sections.filter(s => s.title && s.content?.nodes?.length > 0);
  };

  /**
   * Generate full HTML from Wix nodes
   */
  const generateHtmlFromWixNodes = (nodes: any[] = []): string => {
    let html = "";
    
    for (const node of nodes) {
      if (node.type === "PARAGRAPH" && node.nodes) {
        const text = extractTextFromWixNodes(node.nodes);
        if (text) {
          html += `<p>${text}</p>`;
        }
      } else if (node.type === "HEADING") {
        const level = node.headingData?.level || 3;
        const text = extractTextFromWixNodes(node.nodes);
        if (text) {
          html += `<h${level}>${text}</h${level}>`;
        }
      } else if (node.type === "BULLETED_LIST" && node.nodes) {
        html += "<ul>";
        for (const item of node.nodes) {
          const itemText = extractTextFromWixNodes(item.nodes);
          html += `<li>${itemText}</li>`;
        }
        html += "</ul>";
      } else if (node.type === "IMAGE" && node.imageData) {
        const imgUrl = node.imageData.image?.src?.url || node.imageData.src?.url;
        const altText = node.imageData.altText || "Image";
        if (imgUrl) {
          html += `<img src="${imgUrl}" alt="${altText}" style="max-width:100%;height:auto;" />`;
        }
      }
    }
    
    return html;
  };

  /**
   * Count words in Wix nodes
   */
  const countWordsInNodes = (nodes: any[] = []): number => {
    const text = extractTextFromWixNodes(nodes);
    return text.split(/\s+/).filter(w => w.length > 0).length;
  };

  /**
   * Extract keywords from text
   */
  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    return words
      .filter(w => w.length > 4)
      .slice(0, 10)
      .filter((w, i, arr) => arr.indexOf(w) === i);
  };

  const startNewBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/research",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            topic: newTopic,
            location: newLocation,
            sport: newSport,
            numSections,
            includeChecklist,
            includeFaq,
            includeInternalCta,
            includeOverview,
            includeAuthorTakeaway,
            authorTakeawayText,
          }),
        },
        1
      );

      if (response.ok) {
        hydrateDraftEditor(data.draft);
        setResearchData(data.research || data.draft.researchData || null);
        setOutline(data.outline || []);
        setEditableOutline(data.outline || []);
        setSectionTargetWords(generateTargetWordCounts(data.outline || []));
        setCurrentSectionIndex(0);

        setNewTopic("");
        setNewLocation("");
        setNewSport("");
        setActiveTab("edit");
        loadDrafts(auth);
      }
    } catch (error) {
      console.error("Failed to start blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutline = async (draftId: string, auth: string, numSections: number = 5) => {
    if (!draftId || !auth) {
      alert("Missing draft or authentication. Please reload the page.");
      return;
    }
    setGeneratingOutline(true);
    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        `/api/blog/write-section?draftId=${draftId}&action=generateOutline&numSections=${numSections}`,
        {
          method: "GET",
          headers: { 
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
          },
        },
        1
      );

      if (response.ok && data.outline && data.outline.length > 0) {
        setOutline(data.outline);
        setEditableOutline(data.outline);
        setSectionTargetWords(generateTargetWordCounts(data.outline));
        setCurrentSectionIndex(0);
      } else {
        const errorMsg = data?.error || `HTTP ${response.status}: Failed to generate outline`;
        console.error("Outline generation failed:", errorMsg);
        alert(`Failed to generate outline: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Error generating outline: ${errorMsg}`);
      
      // Set a default outline if generation fails
      const defaultOutline = [
        "Introduction",
        "Key Points",
        "Benefits",
        "Implementation",
        "Conclusion",
      ];
      setOutline(defaultOutline);
      setEditableOutline(defaultOutline);
      setSectionTargetWords(defaultOutline.map(() => 300)); // Initialize all sections to 300 words
    } finally {
      setGeneratingOutline(false);
    }
  };

  const handleGenerateOutline = () => {
    if (!selectedDraft?.id) {
      alert("Select or create a draft first.");
      return;
    }
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in again to generate an outline.");
      return;
    }
    generateOutline(selectedDraft.id, auth, numSections);
  };

  const regenerateOutlineSection = async (sectionIndex: number) => {
    if (!selectedDraft?.id) {
      alert("Select or create a draft first.");
      return;
    }
    if (!editableOutline || sectionIndex < 0 || sectionIndex >= editableOutline.length) {
      alert("Invalid section index.");
      return;
    }
    
    const auth = localStorage.getItem("admin_auth") || "";
    if (!auth) {
      alert("Please log in again to regenerate a section.");
      return;
    }
    
    setRegeneratingOutlineSection(sectionIndex);
    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        `/api/blog/write-section?draftId=${selectedDraft.id}&action=regenerateOutlineSection&sectionIndex=${sectionIndex}&numSections=${editableOutline.length}`,
        {
          method: "GET",
          headers: { 
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045"
          },
        },
        1
      );

      if (response.ok && data.outlineItem) {
        // Update only the specific section in the outline
        const updatedOutline = [...editableOutline];
        updatedOutline[sectionIndex] = data.outlineItem;
        setEditableOutline(updatedOutline);
        setOutline(updatedOutline);
        
        // Recalculate word count for this section
        const updatedWordCounts = [...sectionTargetWords];
        updatedWordCounts[sectionIndex] = generateTargetWordCounts([data.outlineItem])[0];
        setSectionTargetWords(updatedWordCounts);
        
        alert(`Section "${data.outlineItem}" regenerated successfully!`);
      } else {
        const errorMsg = data?.error || `HTTP ${response.status}: Failed to regenerate section`;
        console.error("Section regeneration failed:", errorMsg);
        alert(`Failed to regenerate section: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to regenerate section:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert(`Error regenerating section: ${errorMsg}`);
    } finally {
      setRegeneratingOutlineSection(null);
    }
  };

  const writeNextSection = async (sectionIndex?: number) => {
    // Ensure targetIndex is a number
    const rawIndex = sectionIndex !== undefined ? sectionIndex : currentSectionIndex;
    const targetIndex = typeof rawIndex === 'number' ? parseInt(String(rawIndex)) : 0;
    
    if (!selectedDraft) {
      alert("No draft selected. Please create or select a draft first.");
      return;
    }
    
    if (!editableOutline || !Array.isArray(editableOutline) || editableOutline.length === 0) {
      alert("No outline found. Please generate an outline first.");
      return;
    }
    
    if (targetIndex < 0 || targetIndex >= editableOutline.length) {
      alert(`Section ${targetIndex + 1} does not exist. Outline has ${editableOutline.length} sections.`);
      return;
    }

    setWritingSection(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/write-section",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            sectionTitle: editableOutline[targetIndex],
            sectionIndex: targetIndex,
            sectionNumber: targetIndex + 1,
            tone: "professional",
            targetAudience: "physiotherapy patients",
            targetWords: sectionTargetWords[targetIndex] || 300,
            externalLinksPerSection,
            internalLinksPerSection,
            allSectionTitles: editableOutline,
            location: editableDraftLocation,
            sport: editableDraftSport,
          }),
        },
        1
      );

      if (response.ok) {
        // Update the specific section index, not append
        const updatedSections = [...sections];
        const newSection = data.section;
        // Ensure contentHtml is generated if section has Ricos content
        if (!newSection.contentHtml && newSection.content && typeof newSection.content === 'object') {
          newSection.contentHtml = ricosToHtml(newSection.content);
        }
        updatedSections[targetIndex] = newSection;
        setSections(updatedSections);
        setSelectedDraft((prev) =>
          prev
            ? {
                ...prev,
                sections: updatedSections,
              }
            : prev
        );
        
        // Auto-filter relevant published blogs based on this section
        if (publishedBlogs.length === 0) {
          // Load published blogs first if not already loaded
          const loaded = await loadPublishedBlogs();
          if (loaded && loaded.length > 0) {
            filterRelevantBlogs(
              editableOutline[targetIndex],
              newSection.contentHtml || ""
            );
            // Auto-insert top relevant links
            setTimeout(() => autoInsertTopLinks(targetIndex), 100);
          }
        } else {
          // Otherwise filter with already-loaded blogs
          filterRelevantBlogs(
            editableOutline[targetIndex],
            newSection.contentHtml || ""
          );
          // Auto-insert top relevant links
          setTimeout(() => autoInsertTopLinks(targetIndex), 100);
        }
        
        // Move to next section
        if (targetIndex < editableOutline.length - 1) {
          setCurrentSectionIndex(targetIndex + 1);
        }
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to write section`;
        console.error("Write section failed:", response.status, data);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to write section:", error);
      alert(`Error writing section: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setWritingSection(false);
    }
  };

  const regenerateSection = async (sectionIndex: number) => {
    if (!selectedDraft || !editableOutline[sectionIndex]) return;

    setWritingSection(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/write-section",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            sectionTitle: editableOutline[sectionIndex],
            sectionIndex,
            sectionNumber: sectionIndex + 1,
            tone: "professional",
            targetAudience: "physiotherapy patients",
            targetWords: sectionTargetWords[sectionIndex] || 300,
            externalLinksPerSection,
            internalLinksPerSection,
            allSectionTitles: editableOutline,
            location: editableDraftLocation,
            sport: editableDraftSport,
          }),
        },
        1
      );

      if (response.ok) {
        // Update the specific section
        const updatedSections = [...sections];
        const newSection = data.section;
        // Ensure contentHtml is generated if section has Ricos content
        if (!newSection.contentHtml && newSection.content && typeof newSection.content === 'object') {
          newSection.contentHtml = ricosToHtml(newSection.content);
        }
        updatedSections[sectionIndex] = newSection;
        setSections(updatedSections);
        setSelectedDraft((prev) =>
          prev
            ? {
                ...prev,
                sections: updatedSections,
              }
            : prev
        );
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to regenerate section`;
        console.error("Regenerate section failed:", response.status, data);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to regenerate section:", error);
      alert(`Error regenerating section: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setWritingSection(false);
    }
  };

  const generateFeaturedImage = async () => {
    if (!selectedDraft?.topic) {
      alert("Please enter a topic first");
      return;
    }

    setGeneratingImage(true);
    
    try {
      // Read custom prompt from localStorage if available
      const customPrompt = localStorage.getItem("blog_image_prompt");
      
      const response = await fetch("/api/blog/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionTitle: selectedDraft.topic,
          topic: selectedDraft.topic,
          keywords: researchData?.keywords || [],
          customPrompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error || `HTTP ${response.status}: Failed to generate image`;
        console.error("[Admin] Featured image generation error:", errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.imageUrl) {
        console.error("[Admin] No imageUrl in featured image response");
        throw new Error("No image URL returned");
      }
      
      console.log("[Admin] Featured image generated successfully:", data.format);
      setGeneratedImageUrl(data.imageUrl);
      setEditableFeaturedImageUrl(data.imageUrl);
        
      // Show optimization feedback
      if (data.optimization) {
        const symbol = data.optimization.compressed ? "✓" : "⚠️";
        const status = data.optimization.compressed 
          ? "Image optimized and converted to WebP!"
          : "Image saved (optimization not available - check GCP config)";
        alert(`${symbol} ${status}\n${data.optimization.format} • ${data.optimization.quality}`);
      }
    } catch (error) {
      console.error("Featured image generation error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      
      // Provide helpful hints based on error type
      let helpText = errorMsg;
      if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
        helpText += "\n\nTip: Check your OpenAI account usage/quota at https://platform.openai.com/account/usage";
      }
      if (errorMsg.includes("API") || errorMsg.includes("configuration")) {
        helpText += "\n\nTip: Verify OPENAI_API_KEY is set in .env.local";
      }
      if (errorMsg.includes("WebP") || errorMsg.includes("compression")) {
        helpText += "\n\nTip: WebP conversion failed. Image will use original format. Check server logs for details.";
      }
      
      alert(`Error generating image:\n${helpText}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateSectionImage = async (sectionIndex: number) => {
    // Allow generating images from outline even if section not written yet
    if (sectionIndex < 0 || sectionIndex >= editableOutline.length) {
      alert("Invalid section index");
      return;
    }

    setGeneratingSectionImage(sectionIndex);

    try {
      // Get section data: use written section if available, otherwise use outline title
      const section = sections[sectionIndex];
      const sectionTitle = section?.title || editableOutline[sectionIndex];
      const sectionContent = section 
        ? (typeof section.content === 'string' 
            ? section.content 
            : (section.contentHtml || '').replace(/<[^>]*>/g, ''))
        : ''; // Empty content if section not written yet

      // Read custom prompt from localStorage if available
      const customPrompt = localStorage.getItem("blog_image_prompt");
      
      const response = await fetch("/api/blog/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionTitle: sectionTitle,
          sectionContent: sectionContent,
          topic: editableDraftTopic,
          keywords: [
            ...((researchData?.keywords || []).slice(0, 2)),
            sectionTitle
          ],
          customPrompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error || `HTTP ${response.status}: Failed to generate image`;
        console.error(`[Admin] Image generation error for section ${sectionIndex}:`, errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.imageUrl) {
        console.error(`[Admin] No imageUrl in response for section ${sectionIndex}`);
        throw new Error("No image URL returned from server");
      }

      console.log(`[Admin] Image generated successfully for section ${sectionIndex}: ${data.format}`);
        // Update section with image locally
        const updatedSections = [...sections];
        if (updatedSections[sectionIndex]) {
          updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            imageUrl: data.imageUrl,
          };
          setSections(updatedSections);
        }
        
        // Store in sectionImages state for quick reference
        setSectionImages(prev => ({
          ...prev,
          [sectionIndex]: data.imageUrl
        }));

        // Store metadata if available
        if (data.metadata) {
          setSectionImageMetadata(prev => ({
            ...prev,
            [sectionIndex]: data.metadata
          }));
        }

        // Show optimization feedback
        if (data.optimization) {
          const symbol = data.optimization.compressed ? "✓" : "⚠️";
          const feedback = `${symbol} ${data.optimization.format} (${data.optimization.quality})`;
          setImageOptimizationFeedback(prev => ({
            ...prev,
            [sectionIndex]: feedback
          }));
          // Clear feedback after 6 seconds
          setTimeout(() => {
            setImageOptimizationFeedback(prev => {
              const updated = { ...prev };
              delete updated[sectionIndex];
              return updated;
            });
          }, 6000);
        }

        // Save the section image to the database
        try {
          const auth = localStorage.getItem("admin_auth") || "";
          const draftResponse = await fetch("/api/blog/draft", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: auth,
            },
            body: JSON.stringify({
              draftId: selectedDraft?.id,
              sectionImageUpdate: {
                sectionIndex,
                imageUrl: data.imageUrl,
                metadata: data.metadata,
              },
            }),
          });

          if (!draftResponse.ok) {
            const error = await draftResponse.json();
            console.warn("Failed to save section image to database:", error);
            // Don't fail the entire operation, just warn
          } else {
            console.log(`[Admin] Section ${sectionIndex} image saved to database`);
          }
        } catch (saveError) {
          console.warn("Error saving section image to database:", saveError);
          // Don't fail the entire operation
        }
    } catch (error) {
      console.error("Section image generation error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      
      // Provide helpful hints based on error type
      let helpText = errorMsg;
      if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
        helpText += "\n\n💡 Tip: Check your OpenAI account usage/quota at https://platform.openai.com/account/usage";
      }
      if (errorMsg.includes("API") || errorMsg.includes("configuration")) {
        helpText += "\n\n💡 Tip: Verify OPENAI_API_KEY is set in .env.local";
      }
      if (errorMsg.includes("WebP") || errorMsg.includes("compression")) {
        helpText += "\n\n💡 Tip: WebP conversion failed. Image will use original format. Check server logs.";
      }
      if (helpText === errorMsg) {
        helpText += "\n\n💡 Check server logs for more details (starting with [ImageGen])";
      }
      
      alert(`Error generating section image:\n${helpText}`);
    } finally {
      setGeneratingSectionImage(null);
    }
  };

  const generateAllSectionImages = async () => {
    if (!sections || sections.length === 0) {
      alert("No sections to generate images for");
      return;
    }

    // Show confirmation
    const hasExisting = sections.some(s => s?.imageUrl);
    if (hasExisting) {
      const confirm = window.confirm(
        "Some sections already have images. Generate for all sections anyway?"
      );
      if (!confirm) return;
    }

    // Generate images sequentially for all sections
    let count = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i]) {
        try {
          await generateSectionImage(i);
          count++;
          // Small delay between requests to avoid rate limiting
          await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
          console.error(`Failed to generate image for section ${i}:`, error);
        }
      }
    }
    
    alert(`Generated images for ${count} section(s)`);
  };

  const assembleBlog = async () => {
    if (!selectedDraft) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ 
            draftId: selectedDraft.id,
            assembleOnly: true,
            sections,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
            selectedSourceIds,
            includeChecklist: selectedDraft.includeChecklist !== false,
            includeFaq: selectedDraft.includeFaq !== false,
            includeInternalCta: selectedDraft.includeInternalCta !== false,
            includeOverview: selectedDraft.includeOverview !== false,
            includeAuthorTakeaway: selectedDraft.includeAuthorTakeaway === true,
            authorTakeawayText: selectedDraft.authorTakeawayText || "",
          }),
        },
        1
      );

      if (response.ok) {
        console.log("Assembly successful! Response data:", data);
        console.log("Draft status after assembly:", data.draft?.status);
        alert("Blog post assembled successfully!");
        hydrateDraftEditor(data.draft);
        setAssembledBlog(data.blogPost); // Store assembled blog data
        // Regenerate outline to show in the UI
        generateOutline(data.draft.id, auth, numSections);
        loadDrafts(auth);
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to assemble`;
        console.error("Assembly failed:", errorMessage);
        alert(`Assembly failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to assemble blog:", error);
      alert(`Assembly error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const reapplyMetadata = async () => {
    if (!selectedDraft?.researchData) {
      alert("Run research first to generate metadata from your selections.");
      return;
    }

    if (!selectedDraft?.id) {
      alert("Draft ID is missing. Please reload the page and try again.");
      console.error("Missing draft ID:", selectedDraft);
      return;
    }

    setReapplyingMetadata(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            assembleOnly: true,
            sections,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
            selectedSourceIds,
            includeChecklist: selectedDraft.includeChecklist !== false,
            includeFaq: selectedDraft.includeFaq !== false,
            includeInternalCta: selectedDraft.includeInternalCta !== false,
            includeOverview: selectedDraft.includeOverview !== false,
            includeAuthorTakeaway: selectedDraft.includeAuthorTakeaway === true,
            authorTakeawayText: selectedDraft.authorTakeawayText || "",
            refreshMetadata: true,
            preserveStatus: selectedDraft.status !== "assembled",
          }),
        },
        1
      );

      if (response.ok) {
        hydrateDraftEditor(data.draft);
        // Also update the drafts list and ensure the selected draft is updated
        await loadDrafts(auth);
        setSelectedDraft(data.draft);
      } else {
        const errorMessage =
          data?.error || `HTTP ${response.status}: Failed to refresh metadata`;
        console.error("Metadata refresh failed:", response.status, data);
        alert(`Metadata refresh failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to refresh metadata:", error);
      alert(
        `Unable to refresh metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setReapplyingMetadata(false);
    }
  };

  const regenerateExtras = async (section?: "faqs" | "checklist" | "links" | "authorTakeaway") => {
    if (!selectedDraft || !editableDraftTopic) {
      alert("No draft or topic found");
      return;
    }

    const isRegeneratingAll = !section;
    if (isRegeneratingAll) {
      setRegeneratingExtras(true);
    } else {
      setRegeneratingSection(section);
    }

    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/regenerate-extras",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({
            draftId: selectedDraft.id,
            topic: editableDraftTopic,
            section: section || "all",
          }),
        },
        1
      );

      if (response.ok && assembledBlog) {
        // Update the assembled blog with regenerated content
        const updates: any = {};
        if (!section || section === "faqs") {
          // Only update if faqs were actually generated
          if ("faqs" in data) {
            updates.faqs = data.faqs;
          }
        }
        if (!section || section === "checklist") {
          // Only update if checklist was actually generated
          if ("checklist" in data) {
            updates.checklist = data.checklist;
          }
        }
        if (!section || section === "links") {
          // Only update if outboundLinks were actually generated
          if ("outboundLinks" in data) {
            updates.outboundLinks = data.outboundLinks;
          }
        }
        if (!section || section === "authorTakeaway") {
          // Only update if author takeaway was actually generated
          if ("authorTakeaway" in data && data.authorTakeaway) {
            updates.authorTakeaway = data.authorTakeaway;
            // Also update the draft's authorTakeawayText so future assemblies use it
            setSelectedDraft((prev) =>
              prev ? { ...prev, authorTakeawayText: data.authorTakeaway } : prev
            );
          }
        }

        const updatedBlog = {
          ...assembledBlog,
          metadata: {
            ...assembledBlog.metadata,
            ...updates,
          },
        };
        setAssembledBlog(updatedBlog);

        const sectionName = section
          ? section === "faqs"
            ? "FAQs"
            : section === "checklist"
            ? "Checklist"
            : section === "authorTakeaway"
            ? "Author's Takeaway"
            : "Sources"
          : "all sections";
        alert(`${sectionName} regenerated successfully!`);
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to regenerate`;
        console.error("Regenerate extras failed:", errorMessage);
        alert(`Failed to regenerate: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to regenerate extras:", error);
      alert(
        `Error regenerating: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      if (isRegeneratingAll) {
        setRegeneratingExtras(false);
      } else {
        setRegeneratingSection(null);
      }
    }
  };

  const publishBlog = async () => {
    if (!selectedDraft) return;

    setLoading(true);
    const auth = localStorage.getItem("admin_auth") || "";

    try {
      const { res: response, json: data } = await fetchJsonWithRetry(
        "/api/blog/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: auth,
            "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
          },
          body: JSON.stringify({ 
            draftId: selectedDraft.id,
            sections,
            metadata: {
              title: editableTitle,
              slug: editableSlug,
              excerpt: editableExcerpt,
              seoTitle: editableSeoTitle,
              seoDescription: editableSeoDescription,
              featuredImageUrl: editableFeaturedImageUrl,
              // Include regenerated extras so they get pushed to Wix
              faqs: assembledBlog?.metadata?.faqs,
              checklist: assembledBlog?.metadata?.checklist,
              outboundLinks: assembledBlog?.metadata?.outboundLinks,
            },
            content: editableContent,
            selectedSourceIds: selectedSourceIds,
            topic: editableDraftTopic,
            location: editableDraftLocation,
            sport: editableDraftSport,
            includeChecklist: selectedDraft.includeChecklist !== false,
            includeFaq: selectedDraft.includeFaq !== false,
            includeInternalCta: selectedDraft.includeInternalCta !== false,
            includeOverview: selectedDraft.includeOverview !== false,
            includeAuthorTakeaway: selectedDraft.includeAuthorTakeaway === true,
            authorTakeawayText: selectedDraft.authorTakeawayText || "",
          }),
        },
        1
      );

      if (response.ok) {
        const publishVerb = selectedDraft.wixPostId ? "Updated" : "Published";
        alert(`${publishVerb}! View at: ${data.url}`);
        clearDraftAutosave(selectedDraft.id);
        hydrateDraftEditor(data.draft);
        setAssembledBlog(data.blogPost);
        loadDrafts(auth);
        setActiveTab("edit");
      } else {
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to publish`;
        console.error("Publish failed:", errorMessage);
        alert(`Publish failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to publish:", error);
      alert(`Publish error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const completedSections = (selectedDraft?.sections || []).filter(Boolean);
  const canReapplyMetadata = !!selectedDraft?.researchData;
  const canWriteSections =
    !!selectedDraft &&
    (selectedDraft.status === "writing" || selectedDraft.status === "draft");

  // Simple markdown to HTML converter for preview
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Convert explicit [H1]-[H6] markers directly into HTML headings.
    html = html.replace(/\[H([1-6])\]([\s\S]*?)\[\/H\1\]/gi, (_match, level, text) => {
      const headingLevel = Math.min(Math.max(parseInt(level, 10) || 4, 1), 6);
      return `<h${headingLevel}>${text.trim()}</h${headingLevel}>`;
    });

    // Headers
    html = html.replace(/^###### (.*?)$/gm, "<h6>$1</h6>");
    html = html.replace(/^##### (.*?)$/gm, "<h5>$1</h5>");
    html = html.replace(/^#### (.*?)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks to paragraphs
    html = html.replace(/\n\n/g, "</p><p>");
    html = "<p>" + html + "</p>";

    // Lists
    html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    return html;
  };

  const getSectionRenderedHtml = (section: any): string => {
    if (!section) return "";

    if (typeof section.content === "string") {
      return convertMarkdownToHtml(section.content);
    }

    if (section.contentHtml) {
      return section.contentHtml;
    }

    if (section.content && typeof section.content === "object") {
      return ricosToHtml(section.content);
    }

    return "";
  };

  const convertHtmlToMarkdownish = (html: string): string => {
    if (!html) return "";

    let text = html;
    text = text.replace(/<br\s*\/?>(?=\s*<)/gi, "\n");
    text = text.replace(/<br\s*\/?>(?!\s*<)/gi, "\n");
    text = text.replace(/<p[^>]*>/gi, "\n\n");
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(/<li[^>]*>/gi, "\n- ");
    text = text.replace(/<\/li>/gi, "");
    text = text.replace(/<ul[^>]*>/gi, "\n");
    text = text.replace(/<\/ul>/gi, "\n");
    text = text.replace(/<ol[^>]*>/gi, "\n");
    text = text.replace(/<\/ol>/gi, "\n");
    text = text.replace(/<h([1-6])[^>]*>/gi, (_match, level) => `\n\n[H${level}]`);
    text = text.replace(/<\/h([1-6])>/gi, (_match, level) => `[/H${level}]\n\n`);
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
    text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
    text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
    text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, (_match, href, inner) => {
      const anchorText = inner.replace(/<[^>]+>/g, "").trim();
      return anchorText ? `[${anchorText}](${href})` : href;
    });
    text = text.replace(/&nbsp;/gi, " ");
    text = text.replace(/&amp;/gi, "&");
    text = text.replace(/&lt;/gi, "<");
    text = text.replace(/&gt;/gi, ">");
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/&#39;/gi, "'");
    text = text.replace(/<[^>]+>/g, "");
    return text.replace(/\n{3,}/g, "\n\n").trim();
  };

  const updateSectionContentFromRaw = (
    updatedSections: any[],
    index: number,
    rawContent: string,
    options: { isHtml?: boolean } = {}
  ) => {
    if (index < 0 || index >= updatedSections.length) return;
    const markdownSource = options.isHtml
      ? convertHtmlToMarkdownish(rawContent)
      : rawContent;
    const normalizedContent = markdownSource || "";
    const ricosContent = convertToRicos(normalizedContent);
    updatedSections[index] = {
      ...updatedSections[index],
      content: ricosContent,
      contentHtml: ricosToHtml(ricosContent),
      wordCount: normalizedContent.split(/\s+/).filter(Boolean).length,
    };
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Blog Admin Dashboard
          </h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper function to extract linked phrases from content
  const extractLinksFromContent = (content: string): string[] => {
    if (!content) return [];
    
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      links.push(match[1]); // Extract the anchor text
    }

    return links;
  };

  const getSectionLinks = (section: any): Array<{ text: string; url: string }> => {
    if (!section) return [];

    const linkMap = new Map<string, { text: string; url: string }>();

    const addLink = (text?: string, url?: string) => {
      if (!text || !url) return;
      const key = `${text.trim()}|${url.trim()}`;
      if (!linkMap.has(key)) {
        linkMap.set(key, { text: text.trim(), url: url.trim() });
      }
    };

    if (typeof section.content === "string") {
      extractLinksFromMarkdown(section.content).forEach((link) => addLink(link.text, link.url));
    }

    extractLinksFromHtml(getSectionRenderedHtml(section)).forEach((link) =>
      addLink(link.text, link.url)
    );

    return Array.from(linkMap.values());
  };

  // Helper function to render content with highlighted anchor text
  const renderContentWithHighlightedLinks = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Pattern to match markdown links: [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the highlighted anchor text (without the URL)
      const anchorText = match[1];
      parts.push(
        <span key={`link-${match.index}`} className="bg-blue-500 text-white font-bold px-2 py-0.5 rounded underline">
          {anchorText}
        </span>
      );

      lastIndex = linkPattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    // If no links found, just return the content as-is
    if (parts.length === 0) {
      return <span>{content}</span>;
    }

    return <span>{parts}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Blog Generator</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Blogs ({drafts.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Create New
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "published"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Published Posts ({wixPosts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List Tab */}
        {activeTab === "list" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">My Blog Drafts</h2>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={drafts.length > 0 && selectedDraftIds.length === drafts.length}
                    onChange={toggleSelectAllDrafts}
                    disabled={drafts.length === 0 || bulkDeleting}
                    className="h-4 w-4"
                  />
                  Select all
                </label>
                <button
                  onClick={deleteSelectedDrafts}
                  disabled={selectedDraftIds.length === 0 || bulkDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm font-medium"
                >
                  {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedDraftIds.length})`}
                </button>
                <button
                  onClick={deleteAllDrafts}
                  disabled={drafts.length === 0 || bulkDeleting}
                  className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:bg-gray-400 text-sm font-medium"
                >
                  Delete All Drafts
                </button>
                <button
                  onClick={loadWixPublishedPosts}
                  disabled={loadingWixPosts || bulkDeleting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
                >
                  {loadingWixPosts ? "Loading..." : "📝 Edit Published Blog"}
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    hydrateDraftEditor(draft);
                    if (draft.status !== "draft") {
                      generateOutline(draft.id, localStorage.getItem("admin_auth") || "");
                    } else {
                      setOutline([]);
                      setEditableOutline([]);
                      setSectionTargetWords([]);
                    }
                    setActiveTab("edit");
                  }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <label
                        className="mt-1 inline-flex"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDraftIds.includes(draft.id)}
                          onChange={() => toggleDraftSelection(draft.id)}
                          disabled={bulkDeleting}
                          className="h-4 w-4"
                          aria-label={`Select draft ${draft.topic}`}
                        />
                      </label>
                      <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {draft.topic}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Sections: {draft.sections?.length || 0} | Status:{" "}
                        <span className="font-medium capitalize">
                          {draft.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(draft.createdAt).toLocaleDateString()}
                      </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          draft.status === "published"
                            ? "bg-green-100 text-green-800"
                            : draft.status === "assembled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {draft.status}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteDraft(draft.id, draft.topic);
                        }}
                        disabled={deletingDraftId === draft.id || bulkDeleting}
                        className="mt-2 block w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingDraftId === draft.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {drafts.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">
                    No blogs yet. Create a new one to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Blog Post
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={startNewBlog} className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g., Kilmarnock, Ayrshire"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Topic and Sport */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="e.g., Sports Injury Recovery"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sport
                    </label>
                    <input
                      type="text"
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value)}
                      placeholder="e.g., Football, Tennis, Running"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Number of Sections */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sections
                  </label>
                  <select
                    value={numSections}
                    onChange={(e) => setNumSections(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value={3}>3 sections</option>
                    <option value={4}>4 sections</option>
                    <option value={5}>5 sections</option>
                    <option value={6}>6 sections</option>
                    <option value={7}>7 sections</option>
                    <option value={8}>8 sections</option>
                    <option value={10}>10 sections</option>
                  </select>
                </div>

                {/* Content Options */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">Include in Generated Content:</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeOverview}
                        onChange={(e) => setIncludeOverview(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Overview + Table of Contents</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeChecklist}
                        onChange={(e) => setIncludeChecklist(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Recovery Checklist</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeFaq}
                        onChange={(e) => setIncludeFaq(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">FAQ Section</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeInternalCta}
                        onChange={(e) => setIncludeInternalCta(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Internal CTA (Call to Action)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeAuthorTakeaway}
                        onChange={(e) => setIncludeAuthorTakeaway(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Author's Professional Takeaway</span>
                    </label>
                  </div>
                  {includeAuthorTakeaway && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Professional Experience (will be included as a personal takeaway):
                      </label>
                      <textarea
                        value={authorTakeawayText}
                        onChange={(e) => setAuthorTakeawayText(e.target.value)}
                        placeholder="Example: 'With 10+ years of physio experience, I have seen these techniques transform recovery outcomes for my clients...'"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 This text will be incorporated into the blog post to add your professional perspective
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? "Starting Research..." : "Start Blog"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === "edit" && selectedDraft && (
          <div className="space-y-6">
            {/* Draft Info & Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="bg-white/70 border border-white/60 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    Current Context
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      Topic: {editableDraftTopic || "Not set"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                      Location: {editableDraftLocation || "Not set"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                      Subject/Sport: {editableDraftSport || "Not set"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Reassemble & Reapply */}
                {selectedDraft.status !== "draft" && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={assembleBlog}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:bg-gray-400"
                      title="Reassemble blog with current sections and metadata"
                    >
                      {loading ? "Reassembling..." : "⟳ Reassemble"}
                    </button>
                    <button
                      onClick={reapplyMetadata}
                      disabled={reapplyingMetadata}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                      title="Reapply metadata fresh from research data"
                    >
                      {reapplyingMetadata ? "Refreshing..." : "↻ Reapply Metadata"}
                    </button>
                  </div>
                )}

                {/* Location, Topic and Sport */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editableDraftLocation}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftLocation(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, location: value } : prev
                        );
                      }}
                      placeholder="e.g., Kilmarnock, Ayrshire"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={editableDraftTopic}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftTopic(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, topic: value } : prev
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                    <input
                      type="text"
                      value={editableDraftSport}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableDraftSport(value);
                        setSelectedDraft((prev) =>
                          prev ? { ...prev, sport: value } : prev
                        );
                      }}
                      placeholder="e.g., Football, Tennis, Running"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={reapplyMetadata}
                    disabled={!canReapplyMetadata || reapplyingMetadata}
                    title={
                      !canReapplyMetadata
                        ? "Assemble the blog before refreshing metadata."
                        : undefined
                    }
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      !canReapplyMetadata || reapplyingMetadata
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {reapplyingMetadata ? "Reapplying metadata..." : "Reapply Metadata"}
                  </button>
                  <p className="text-xs text-gray-500">
                    Regenerates title, slug, and SEO fields using the selections above.
                  </p>
                </div>

                {/* Content Options */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2 uppercase">Content Options:</p>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeChecklist !== false}
                        onChange={(e) => {
                          if (!selectedDraft) return;
                          const checked = e.target.checked;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, includeChecklist: checked } : prev
                          );
                          persistGeneratedContentOptions(selectedDraft.id, {
                            includeChecklist: checked,
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Checklist {selectedDraft?.includeChecklist !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeFaq !== false}
                        onChange={(e) => {
                          if (!selectedDraft) return;
                          const checked = e.target.checked;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, includeFaq: checked } : prev
                          );
                          persistGeneratedContentOptions(selectedDraft.id, {
                            includeFaq: checked,
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">FAQs {selectedDraft?.includeFaq !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeOverview !== false}
                        onChange={(e) => {
                          if (!selectedDraft) return;
                          const checked = e.target.checked;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, includeOverview: checked } : prev
                          );
                          persistGeneratedContentOptions(selectedDraft.id, {
                            includeOverview: checked,
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Overview + TOC {selectedDraft?.includeOverview !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeInternalCta !== false}
                        onChange={(e) => {
                          if (!selectedDraft) return;
                          const checked = e.target.checked;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, includeInternalCta: checked } : prev
                          );
                          persistGeneratedContentOptions(selectedDraft.id, {
                            includeInternalCta: checked,
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Internal CTA {selectedDraft?.includeInternalCta !== false && '✓'}</span>
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDraft?.includeAuthorTakeaway === true}
                        onChange={(e) => {
                          if (!selectedDraft) return;
                          const checked = e.target.checked;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, includeAuthorTakeaway: checked } : prev
                          );
                          persistGeneratedContentOptions(selectedDraft.id, {
                            includeAuthorTakeaway: checked,
                          });
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Author's Professional Takeaway {selectedDraft?.includeAuthorTakeaway === true && '✓'}</span>
                    </label>
                  </div>
                  {selectedDraft?.includeAuthorTakeaway === true && (
                    <div className="mt-3">
                      <textarea
                        value={selectedDraft?.authorTakeawayText || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedDraft((prev) =>
                            prev ? { ...prev, authorTakeawayText: value } : prev
                          );
                        }}
                        onBlur={() => {
                          if (!selectedDraft) return;
                          persistGeneratedContentOptions(selectedDraft.id, {
                            authorTakeawayText: selectedDraft.authorTakeawayText || "",
                          });
                        }}
                        rows={3}
                        placeholder="Add your professional takeaway that should appear in the published post"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  {savingContentOptions && (
                    <p className="mt-2 text-xs text-gray-500">Saving options...</p>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-gray-600">
                      Status: <span className="font-semibold capitalize">{selectedDraft.status}</span>
                    </p>
                    {lastLocalAutosaveAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Autosaved locally at {new Date(lastLocalAutosaveAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDraft(null);
                      setSections([]);
                      setOutline([]);
                      setActiveTab("list");
                    }}
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    ← Back to list
                  </button>
                </div>
              </div>
            </div>

            {/* Research Data */}
            {researchData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Research Data
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {researchData.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Sources Found ({researchData.sources.length})
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {researchData.sources.slice(0, 3).map((source, i) => (
                        <li key={i}>• {source.title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Source Selection & Research More */}
            {researchData && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => setSourceCollapsed(!sourceCollapsed)}>
                      <span className={`text-xl transition-transform ${sourceCollapsed ? '' : 'rotate-90'}`}>▶</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        📚 Research Data & Sources ({researchData.sources.length} found)
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        {selectedSourceIds.length} selected
                      </span>
                    </div>
                    {!sourceCollapsed && (
                      <>
                        <label className="block text-sm text-gray-600 mb-2 mt-4">
                          Search for more specific sources:
                        </label>
                        <input
                          type="text"
                          value={researchQuery}
                          onChange={(e) => setResearchQuery(e.target.value)}
                          placeholder="e.g., 'neck pain exercises', 'physiotherapy recovery'"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {!sourceCollapsed && researchData.sources.length > 0 && (
                      <>
                        <button
                          onClick={() => {
                            // Select all sources
                            const allSourceIds = researchData.sources.map((source: any, i: number) => 
                              buildSourceId(source, i)
                            );
                            setSelectedSourceIds(allSourceIds);
                            setSelectedDraft(prev =>
                              prev
                                ? {
                                    ...prev,
                                    selectedSourceIds: allSourceIds,
                                  }
                                : prev
                            );
                            if (selectedDraft?.id) {
                              persistSelectedSources(selectedDraft.id, allSourceIds);
                            }
                          }}
                          disabled={selectedSourceIds.length === researchData.sources.length}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 whitespace-nowrap text-sm font-medium"
                          title="Select all sources"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSourceIds([]);
                            setSelectedDraft(prev =>
                              prev
                                ? {
                                    ...prev,
                                    selectedSourceIds: [],
                                  }
                                : prev
                            );
                            if (selectedDraft?.id) {
                              persistSelectedSources(selectedDraft.id, []);
                            }
                          }}
                          disabled={selectedSourceIds.length === 0}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 whitespace-nowrap text-sm font-medium"
                          title="Deselect all sources"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${selectedSourceIds.length} selected source(s)?`)) {
                              // Remove all selected sources from research data
                              const updatedSources = researchData.sources.filter((source: any, i: number) => {
                                const sourceId = buildSourceId(source, i);
                                return !selectedSourceIds.includes(sourceId);
                              });
                              const updatedResearchData = {
                                ...researchData,
                                sources: updatedSources,
                              };
                              setResearchData({
                                ...updatedResearchData,
                              });
                              // Clear selection
                              setSelectedSourceIds([]);
                              setSelectedDraft(prev =>
                                prev
                                  ? {
                                      ...prev,
                                      researchData: updatedResearchData,
                                      selectedSourceIds: [],
                                    }
                                  : prev
                              );
                              if (selectedDraft?.id) {
                                persistResearchState(selectedDraft.id, updatedResearchData, []);
                              }
                            }
                          }}
                          disabled={selectedSourceIds.length === 0}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 whitespace-nowrap text-sm font-medium"
                          title="Delete all selected sources"
                        >
                          Delete {selectedSourceIds.length > 0 ? `(${selectedSourceIds.length})` : ""}
                        </button>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        if (!selectedDraft) return;
                        setLoading(true);
                        const auth = localStorage.getItem("admin_auth") || "";
                        try {
                          const response = await fetch("/api/blog/vertex-documents", {
                            headers: { 
                              "Authorization": auth,
                            },
                          });
                          if (!response.ok) {
                            const errorData = await response.json().catch(() => null);
                            const details = errorData?.details ? `\n\nDetails: ${errorData.details}` : "";
                            const hint = errorData?.hint ? `\n\nHint: ${errorData.hint}` : "";
                            throw new Error(`Failed to fetch Vertex documents${details}${hint}`);
                          }
                          
                          const data = await response.json();
                          // Add Vertex documents as sources to research data
                          const vertexSources = data.documents.map((doc: any) => ({
                            title: doc.title,
                            url: doc.uri || `vertex://${doc.id}`,
                            excerpt: doc.excerpt || (doc.content?.substring(0, 200)) || "",
                            source: "Vertex Data Store",
                            content: doc.content,
                            documentId: doc.id,
                          }));
                          const updatedResearchData = {
                            ...researchData,
                            sources: [...researchData.sources, ...vertexSources],
                          };
                          
                          setResearchData({
                            ...updatedResearchData,
                          });
                          
                          // Update draft with new research data
                          if (selectedDraft) {
                            setSelectedDraft({
                              ...selectedDraft,
                              researchData: updatedResearchData,
                            });
                            persistResearchState(
                              selectedDraft.id,
                              updatedResearchData,
                              selectedSourceIds
                            );
                          }
                          alert(`✅ Added ${vertexSources.length} Vertex documents to your sources!`);
                        } catch (error) {
                          console.error("Vertex fetch error:", error);
                          const message = error instanceof Error ? error.message : "Failed to load Vertex documents";
                          alert(message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 whitespace-nowrap text-sm font-medium"
                      title="Load all available documents from Vertex Data Store"
                    >
                      {loading ? "Loading..." : "📖 Vertex Docs"}
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedDraft) return;
                        setLoading(true);
                        const auth = localStorage.getItem("admin_auth") || "";
                        try {
                          const searchTopic = researchQuery.trim() || selectedDraft.topic;
                          const response = await fetch("/api/blog/research", {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              "Authorization": auth,
                              "X-Request-ID": "ba6adc02-0b45-4780-84ba-dc1fde492045",
                            },
                            body: JSON.stringify({ 
                              draftId: selectedDraft.id,
                              topic: searchTopic,
                              researchMore: true 
                            }),
                          });
                          if (!response.ok) throw new Error("Failed to research more sources");
                          
                          const data = await response.json();
                          setResearchData(data.research);
                          
                          // Update draft with new research data
                          if (selectedDraft) {
                            setSelectedDraft({
                              ...selectedDraft,
                              researchData: data.research,
                            });
                          }
                          // Clear the search input
                          setResearchQuery("");
                        } catch (error) {
                          console.error("Research error:", error);
                          alert("Failed to research more sources");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap text-sm font-medium"
                    >
                      {loading ? "Searching..." : "Search Sources"}
                    </button>
                  </div>
                </div>
                {!sourceCollapsed && researchData.sources.length > 0 ? (
                  <div className="space-y-3">
                  {researchData.sources.map((source: any, i: number) => {
                    // Use URL as stable identifier (same as backend)
                    const sourceId = buildSourceId(source, i);
                    const isSelected = selectedSourceIds.includes(sourceId);
                    return (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                          isSelected 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const updatedIds = isSelected
                            ? selectedSourceIds.filter(id => id !== sourceId)
                            : [...selectedSourceIds, sourceId];

                          setSelectedSourceIds(updatedIds);
                          setSelectedDraft(prev =>
                            prev
                              ? {
                                  ...prev,
                                  selectedSourceIds: updatedIds,
                                }
                              : prev
                          );

                          if (selectedDraft?.id) {
                            persistSelectedSources(selectedDraft.id, updatedIds);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{source.title}</p>
                            {(() => {
                              const preview = (source as any).excerpt || (source as any).snippet;
                              return preview ? (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                  {preview}
                                </p>
                              ) : null;
                            })()}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {source.url && (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {source.url.length > 50 ? source.url.substring(0, 47) + '...' : source.url}
                                </a>
                              )}
                              {source.source && (
                                <span className="text-xs text-gray-500">• {source.source}</span>
                              )}
                            </div>
                            {(source.author || source.expert) && (
                              <p className="text-xs text-gray-500 mt-1">
                                ✍️ {source.author || source.expert}
                              </p>
                            )}
                            {source.authority && (
                              <p className="text-xs text-gray-500">
                                🏥 Authority: <span className="capitalize font-medium">{source.authority}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSourceForModal(source);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                              title="View detailed source information"
                            >
                              ℹ️ Info
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove this source from research data
                                const updatedSources = researchData.sources.filter((_, index) => index !== i);
                                const updatedResearchData = {
                                  ...researchData,
                                  sources: updatedSources,
                                };
                                let updatedIds = selectedSourceIds;
                                setResearchData({
                                  ...updatedResearchData,
                                });
                                // Also deselect if it was selected
                                if (isSelected) {
                                  updatedIds = selectedSourceIds.filter(id => id !== sourceId);
                                  setSelectedSourceIds(updatedIds);
                                }

                                setSelectedDraft(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        researchData: updatedResearchData,
                                        selectedSourceIds: updatedIds,
                                      }
                                    : prev
                                );

                                if (selectedDraft?.id) {
                                  persistResearchState(
                                    selectedDraft.id,
                                    updatedResearchData,
                                    updatedIds
                                  );
                                }
                              }}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                              title="Remove this source from the list"
                            >
                              ✕ Remove
                            </button>
                            {isSelected && (
                              <span className="text-green-600 font-bold">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  sourceCollapsed || researchData.sources.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">All sources deleted. Search to find more sources.</p>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Available Internal Blog Posts - Enhanced */}
            {selectedDraft && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow-md p-6 border-2 border-green-200">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        🔗 Internal Blog Links
                      </h3>
                      {relevantBlogs.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold animate-pulse">
                          {relevantBlogs.length} Relevant!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>How to use:</strong> Write a section → Relevant blogs appear below → Click a blog card → Click "✓ Insert Link into [Section]"
                    </p>
                    <div className="bg-white/70 rounded p-3 text-xs text-gray-600 space-y-1 mb-4">
                      <p>✓ <strong>Step 1:</strong> Write a section from the outline</p>
                      <p>✓ <strong>Step 2:</strong> See relevant blogs appear automatically (or click "Load Published Posts" first)</p>
                      <p>✓ <strong>Step 3:</strong> Click a blog card to open the detail modal</p>
                      <p>✓ <strong>Step 4:</strong> Click the green "✓ Insert Link" button to add it to your section</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 whitespace-nowrap">
                    <button
                      onClick={loadPublishedBlogs}
                      disabled={loadingPublishedBlogs}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-bold"
                    >
                      {loadingPublishedBlogs ? "Loading..." : "🔄 Load Posts"}
                    </button>
                    <button
                      onClick={() => insertTopLinksToSection(currentSectionIndex)}
                      disabled={relevantBlogs.length === 0 || currentSectionIndex >= sections.length || !sections[currentSectionIndex] || countInternalLinksInSection(currentSectionIndex) >= internalLinksPerSection}
                      title={relevantBlogs.length === 0 ? "No relevant blogs available" : currentSectionIndex >= sections.length ? "No section selected" : countInternalLinksInSection(currentSectionIndex) >= internalLinksPerSection ? `Link limit reached (${internalLinksPerSection} max)` : `Add up to ${internalLinksPerSection - countInternalLinksInSection(currentSectionIndex)} link(s)`}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: relevantBlogs.length === 0 || currentSectionIndex >= sections.length || !sections[currentSectionIndex] || countInternalLinksInSection(currentSectionIndex) >= internalLinksPerSection ? '#d1d5db' : '#10b981',
                        color: relevantBlogs.length === 0 || currentSectionIndex >= sections.length || !sections[currentSectionIndex] || countInternalLinksInSection(currentSectionIndex) >= internalLinksPerSection ? '#6b7280' : '#fff',
                      }}
                    >
                      {relevantBlogs.length === 0 ? '✓ Add Links (none available)' : `✓ Add ${Math.min(internalLinksPerSection - countInternalLinksInSection(currentSectionIndex), relevantBlogs.length)} Links`}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {publishedBlogs.length > 0 ? (
                    <>
                      {relevantBlogs.length > 0 ? (
                        <>
                          <div className="bg-green-100 border-l-4 border-green-600 p-3 rounded mb-3">
                            <p className="text-sm font-semibold text-green-900">
                              💡 {relevantBlogs.length} relevant blog post{relevantBlogs.length !== 1 ? 's' : ''} found for this section!
                            </p>
                          </div>
                          {relevantBlogs.map((blog, i) => (
                            <div
                              key={blog.id}
                              className="p-4 rounded-lg border-2 border-green-400 bg-white cursor-pointer hover:shadow-lg transition transform hover:-translate-y-0.5"
                              onClick={() => openBlogModal(blog)}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-gray-900">{blog.topic}</p>
                                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                                      {blog.relevanceScore || 0} relevance
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {blog.metadata?.excerpt}
                                  </p>
                                  {blog.metadata?.slug && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      /{blog.metadata.slug}
                                    </p>
                                  )}
                                  {blog.sectionCount > 0 && (
                                    <div className="mt-2 pt-2 border-t border-green-300">
                                      <p className="text-xs font-medium text-green-700 mb-1">
                                        📑 {blog.sectionCount} sections:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {blog.sections?.slice(0, 3).map((section: string, idx: number) => (
                                          <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            {section}
                                          </span>
                                        ))}
                                        {blog.sectionCount > 3 && (
                                          <span className="text-xs text-green-600 px-2 py-1">
                                            +{blog.sectionCount - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {blog.contentPreview && (
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                      &quot;{blog.contentPreview}&quot;
                                    </p>
                                  )}
                                </div>
                                <div className="ml-3 flex-shrink-0 text-right">
                                  <p className="text-xs text-gray-500">
                                    👁 {blog.status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-6 border-2 border-dashed border-amber-300 rounded-lg text-center bg-amber-50">
                          <p className="text-sm text-amber-900">
                            ℹ️ No relevant blogs found for this section
                          </p>
                          <p className="text-xs text-amber-700 mt-2">
                            Write a section to automatically find matching blog posts, or click another section to see its relevant matches.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-gray-400 rounded-lg text-center bg-white">
                      <p className="text-sm font-semibold text-gray-700">
                        📚 No published blog posts loaded yet
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Click "🔄 Load Posts" above to fetch available internal links, or publish blog posts first
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outline & Target Words Per Section */}
            {selectedDraft && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Blog Outline (Editable)
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Sections:</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={numSections}
                        onChange={(e) => setNumSections(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-16 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sections.length > 0 && (
                      <button
                        onClick={generateAllSectionImages}
                        disabled={generatingSectionImage !== null}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-400"
                      >
                        Generate All Images
                      </button>
                    )}
                    {sections.length > 0 && (
                      <button
                        onClick={() => {
                          setSectionImages({});
                          setSectionImageMetadata({});
                          const updatedSections = sections.map(s => ({...s, imageUrl: undefined}));
                          setSections(updatedSections);
                        }}
                        className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700"
                      >
                        Reset Images
                      </button>
                    )}
                    {outline.length > 0 && (
                      <button
                        onClick={() => setSectionTargetWords(generateTargetWordCounts(editableOutline))}
                        className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
                      >
                        Reset Word Counts
                      </button>
                    )}
                    {outline.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Reset entire blog? This will clear all written sections and images.")) {
                            setSections([]);
                            setSectionImages({});
                            setSectionImageMetadata({});
                            setCurrentSectionIndex(0);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                      >
                        Reset Blog
                      </button>
                    )}
                    <button
                      onClick={handleGenerateOutline}
                      disabled={generatingOutline}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {generatingOutline
                        ? "Generating..."
                        : outline.length > 0
                        ? "Regenerate Outline"
                        : "Generate Outline"}
                    </button>
                  </div>
                </div>
                {outline.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-3">
                      💡 Word counts are auto-generated based on section type. Edit or reset counts as needed. Use 🔄 to regenerate individual sections.
                    </p>
                    {Array.isArray(editableOutline) ? (
                    <ol className="space-y-3">
                      {editableOutline.map((section, i) => (
                      <li key={`section-${i}`} className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600 min-w-6">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={section}
                          onChange={(e) => {
                            const updated = [...editableOutline];
                            updated[i] = e.target.value;
                            setEditableOutline(updated);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Section title"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="100"
                            max="2000"
                            value={sectionTargetWords[i] || 300}
                            onChange={(e) => {
                              const updated = [...sectionTargetWords];
                              updated[i] = Math.max(100, parseInt(e.target.value) || 300);
                              setSectionTargetWords(updated);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-16 text-sm"
                          />
                          <span className="text-xs text-gray-600 whitespace-nowrap">words</span>
                        </div>

                        <button
                          onClick={() => regenerateOutlineSection(i)}
                          disabled={regeneratingOutlineSection === i}
                          className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-400 whitespace-nowrap font-medium"
                          title="Regenerate this section title"
                        >
                          {regeneratingOutlineSection === i ? "🔄..." : "🔄"}
                        </button>
                        <button
                          onClick={() => generateSectionImage(i)}
                          disabled={generatingSectionImage === i}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 whitespace-nowrap"
                          title="Generate optimized WebP image (auto-compressed)"
                        >
                          {generatingSectionImage === i 
                            ? "..." 
                            : sections[i]?.imageUrl || sectionImages[i]
                              ? "✓ Img"
                              : "Img"}
                        </button>
                        <button
                          onClick={() => {
                            const saved = localStorage.getItem("blog_image_prompt");
                            setCustomImagePrompt(saved || DEFAULT_IMAGE_PROMPT_TEMPLATE);
                            setShowImagePromptEditor(true);
                          }}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
                          title="Edit image prompt template"
                        >
                          ⚙️
                        </button>
                        {imageOptimizationFeedback[i] && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium whitespace-nowrap">
                            {imageOptimizationFeedback[i]}
                          </span>
                        )}
                        {(sections[i]?.imageUrl || sectionImages[i]) && (
                          <button
                            onClick={() => setViewingOutlineImageIndex(i)}
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
                            title="View image"
                          >
                            👁️
                          </button>
                        )}
                        {!sections[i] && (
                          <button
                            onClick={() => {
                              setCurrentSectionIndex(i);
                              writeNextSection(i);
                            }}
                            disabled={writingSection}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 whitespace-nowrap font-medium"
                          >
                            {writingSection ? "Writing..." : "Write"}
                          </button>
                        )}
                        {sections[i] && (
                          <span className="ml-2 text-green-600 text-sm font-medium">✓ Written</span>
                        )}
                      </li>
                    ))}
                    </ol>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-300 text-sm text-red-700">
                        ⚠️ Outline error: outline structure is invalid. Try regenerating the outline.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600">
                    No outline yet. Click "Generate Outline" to create one using the latest research data.
                  </div>
                )}
              </div>
            )}

            {/* Link Settings (Per Section) */}
            <div className="bg-white rounded-lg shadow p-6">
              {/* Link Settings */}
              {canWriteSections && sections.length < editableOutline.length && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Link Settings (Per Section)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        External Source Links
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={externalLinksPerSection}
                          onChange={(e) => setExternalLinksPerSection(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-medium w-12 text-center">
                          {externalLinksPerSection}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Number of source links per section
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Links
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={internalLinksPerSection}
                          onChange={(e) => setInternalLinksPerSection(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-medium w-12 text-center">
                          {internalLinksPerSection}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Number of internal blog links per section
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Written Sections */}
            {sections.filter(s => s).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Written Sections ({sections.filter(s => s).length}/{editableOutline.length || "?"})
                </h3>
                <div className="space-y-4">
                  {sections.map((section, i) => section && (
                    <div key={i} className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {i + 1}. {section.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {section.wordCount} words
                          </p>
                          <p className="text-gray-700 mt-2 line-clamp-3">
                            {getSectionRenderedHtml(section).replace(/<[^>]*>/g, '').trim().substring(0, 200) || 'No preview available'}
                          </p>
                        </div>
                        <div className="ml-3 flex flex-col gap-2 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setExpandedSectionIndex(i);
                              // Auto-load relevant blogs for this section
                              const section = sections[i];
                              if (section && publishedBlogs.length > 0) {
                                filterRelevantBlogs(
                                  section.title,
                                  typeof section.content === 'string' ? section.content : (section.contentHtml || '')
                                );
                              }
                            }}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            View Full
                          </button>
                          <button
                            onClick={() => {
                              setCurrentSectionIndex(i);
                              regenerateSection(i);
                            }}
                            disabled={writingSection}
                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                          >
                            {writingSection ? "..." : "Regenerate"}
                          </button>
                          <button
                            onClick={() => generateSectionImage(i)}
                            disabled={generatingSectionImage === i}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                            title="Generate optimized WebP image (auto-compressed)"
                          >
                            {generatingSectionImage === i ? "Generating..." : section.imageUrl ? "✓ Image" : "Add Image"}
                          </button>
                          <button
                            onClick={() => {
                              const saved = localStorage.getItem("blog_image_prompt");
                              setCustomImagePrompt(saved || DEFAULT_IMAGE_PROMPT_TEMPLATE);
                              setShowImagePromptEditor(true);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            title="Edit image prompt template"
                          >
                            ⚙️ Edit Prompt
                          </button>

                          {imageOptimizationFeedback[i] && (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded text-center font-medium">
                              {imageOptimizationFeedback[i]}
                            </div>
                          )}
                          {section.imageUrl && (
                            <button
                              onClick={() => setViewingWrittenImageIndex(i)}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                              title="View image"
                            >
                              👁️ View
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Delete section "${section.title}"? This cannot be undone.`)) {
                                const updated = [...sections];
                                updated[i] = null;
                                setSections(updated);
                                setSelectedDraft((prev: any) =>
                                  prev ? { ...prev, sections: updated } : prev
                                );
                              }
                            }}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            title="Delete this section"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Internal Links Management Section */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    📍 Manage Internal Links
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Click a section below to select it, then add internal blog links to it.
                  </p>

                  {/* Load Posts Prompt */}
                  {publishedBlogs.length === 0 && (
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                      <p className="text-sm text-blue-900 mb-2">
                        📌 <strong>No blogs loaded yet.</strong> Click the button below to load published blogs so you can link to them.
                      </p>
                      <button
                        onClick={loadPublishedBlogs}
                        disabled={loadingPublishedBlogs}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                      >
                        {loadingPublishedBlogs ? "Loading..." : "🔄 Load Published Blogs"}
                      </button>
                    </div>
                  )}
                  
                  {/* Section Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {sections.map((section, i) => section && (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedSectionForLinks(i);
                          filterRelevantBlogs(
                            section.title,
                            typeof section.content === 'string' ? section.content : (section.contentHtml || '')
                          );
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedSectionForLinks === i
                            ? 'bg-blue-100 border-blue-500 shadow-md'
                            : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="font-medium text-gray-900">
                          {i + 1}. {section.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          📊 {countInternalLinksInSection(i)}/{internalLinksPerSection} links • {section.wordCount} words
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Relevant Blogs for Selected Section */}
                  {selectedSectionForLinks !== null && sections[selectedSectionForLinks] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-gray-900">
                          Relevant Blogs for Section {selectedSectionForLinks + 1}
                        </h5>
                        <button
                          onClick={() => {
                            const section = sections[selectedSectionForLinks];
                            if (section) {
                              filterRelevantBlogs(
                                section.title,
                                typeof section.content === 'string' ? section.content : (section.contentHtml || '')
                              );
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          🔄 Refresh
                        </button>
                      </div>

                      {/* Display Relevant Blogs */}
                      {relevantBlogs && relevantBlogs.length > 0 ? (
                        <div className="space-y-2">
                          {relevantBlogs.filter((blog: any) => blog && blog.title).map((blog, i) => (
                            <div 
                              key={i} 
                              className="flex justify-between items-start gap-2 p-3 bg-white rounded border-l-4 border-l-green-500 border border-green-100 hover:shadow-md transition"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {blog.title || blog.topic}
                                </p>
                                <p className="text-xs text-green-600 font-semibold mt-1">
                                  🎯 Relevance Score: {blog.relevanceScore || 0}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (selectedSectionForLinks !== null) {
                                    insertBlogLink(blog);
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap flex-shrink-0 font-medium"
                              >
                                ✓ Add
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          No relevant blogs found. Try clicking another section or refreshing.
                        </p>
                      )}

                      {/* Batch Insert Button */}
                      <button
                        onClick={() => {
                          if (selectedSectionForLinks !== null) {
                            insertTopLinksToSection(selectedSectionForLinks);
                          }
                        }}
                        disabled={
                          !relevantBlogs || 
                          relevantBlogs.length === 0 || 
                          countInternalLinksInSection(selectedSectionForLinks!) >= internalLinksPerSection
                        }
                        className={`w-full mt-3 py-2 rounded font-medium transition-colors ${
                          relevantBlogs && 
                          relevantBlogs.length > 0 && 
                          countInternalLinksInSection(selectedSectionForLinks!) < internalLinksPerSection
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                        title={
                          !relevantBlogs || relevantBlogs.length === 0
                            ? 'No relevant blogs found'
                            : countInternalLinksInSection(selectedSectionForLinks!) >= internalLinksPerSection
                            ? `Maximum ${internalLinksPerSection} links reached for this section`
                            : `Add up to ${internalLinksPerSection - countInternalLinksInSection(selectedSectionForLinks!)} more links`
                        }
                      >
                        ✓ Add {Math.min(
                          internalLinksPerSection - countInternalLinksInSection(selectedSectionForLinks! || 0),
                          (relevantBlogs?.length || 0)
                        )} Links
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section Content Modal */}
            {expandedSectionIndex !== null && sections[expandedSectionIndex] && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                  <div className="flex flex-wrap justify-between items-start gap-4 p-6 border-b">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {expandedSectionIndex + 1}. {sections[expandedSectionIndex].title}
                      </h3>
                      {(() => {
                        const sectionLinks = getSectionLinks(sections[expandedSectionIndex]);
                        if (!sectionLinks.length) return null;
                        return (
                          <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-300 shadow-sm">
                            🔗 {sectionLinks.length} {sectionLinks.length === 1 ? "Link" : "Links"}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex gap-2 items-center flex-wrap justify-end">
                      <button
                        onClick={() => setViewLinksMode(!viewLinksMode)}
                        className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                          viewLinksMode 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {viewLinksMode ? 'View Content' : 'View Links'}
                      </button>
                      <button
                        onClick={() => {
                          // Auto-filter relevant blogs when opening modal
                          const section = sections[expandedSectionIndex!];
                          if (section && publishedBlogs.length > 0) {
                            filterRelevantBlogs(
                              section.title,
                              typeof section.content === 'string' ? section.content : (section.contentHtml || '')
                            );
                          }
                          setSelectedSectionForLinks(expandedSectionIndex);
                        }}
                        className="px-3 py-1 text-sm rounded font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        📍 Add Links
                      </button>
                      <button
                        onClick={() => {
                          setExpandedSectionIndex(null);
                          setViewLinksMode(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6">
                    {viewLinksMode ? (
                      // Links View
                      (() => {
                        const links = getSectionLinks(sections[expandedSectionIndex]);
                        return links.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-sm text-gray-600 font-medium">
                                Found {links.length} link{links.length !== 1 ? 's' : ''} in this section
                              </p>
                              <button
                                onClick={() => generateAiExternalSuggestions(expandedSectionIndex!)}
                                disabled={loadingExternalAiSuggestions}
                                className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 font-medium transition-colors flex items-center gap-1"
                              >
                                {loadingExternalAiSuggestions ? "Analyzing..." : "✨ AI Suggest Changes"}
                              </button>
                            </div>
                            {links.map((link, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="mb-2">
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Anchor Text</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {link.text}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">URL</p>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-xs break-all hover:underline"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            No links found in this section
                          </div>
                        );
                      })()
                    ) : (
                      // Content View with Relevant Blogs Sidebar
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                          <div className="section-content">
                            <p className="text-sm text-gray-600 mb-4">
                              {sections[expandedSectionIndex].wordCount} words
                            </p>
                            {(() => {
                              const sectionLinks = getSectionLinks(sections[expandedSectionIndex]);
                              if (!sectionLinks.length) return null;
                              return (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                                      Links detected
                                    </p>
                                    <span className="text-xs font-semibold text-blue-800">
                                      {sectionLinks.length} {sectionLinks.length === 1 ? 'link' : 'links'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {sectionLinks.map((link, idx) => (
                                      <a
                                        key={`${link.url}-${idx}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 hover:border-blue-300 transition"
                                        title={link.url}
                                      >
                                        🔗 {link.text}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                            {sections[expandedSectionIndex].imageUrl && (
                              <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                  src={sections[expandedSectionIndex].imageUrl} 
                                  alt={sections[expandedSectionIndex].title}
                                  className="w-full h-auto"
                                />
                              </div>
                            )}
                            {(() => {
                              const section = sections[expandedSectionIndex];
                              const sectionHtml = getSectionRenderedHtml(section);
                              if (!sectionHtml && !section?.content) {
                                return <div className="text-gray-400">No content available</div>;
                              }

                              return (
                                <div className="section-content text-gray-800 leading-relaxed">
                                  <BlogPostBody
                                    post={{
                                      title: section.title || "Section",
                                      richContent:
                                        section.content && typeof section.content === "object"
                                          ? section.content
                                          : null,
                                      htmlBody: sectionHtml || null,
                                      contentText:
                                        typeof section.content === "string" ? section.content : null,
                                    }}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Sidebar - Add Internal Links */}
                        <div className="lg:col-span-1 bg-blue-50 p-4 rounded-lg border border-blue-200 h-fit">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                            📍 Add Related Blogs
                          </h4>
                          
                          {publishedBlogs.length === 0 ? (
                            <button
                              onClick={loadPublishedBlogs}
                              disabled={loadingPublishedBlogs}
                              className="w-full px-2 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                            >
                              {loadingPublishedBlogs ? "Loading..." : "Load Blogs"}
                            </button>
                          ) : relevantBlogs.length === 0 ? (
                            <div>
                              <p className="text-xs text-gray-600 mb-2">
                                No relevant blogs found for this section
                              </p>
                              <button
                                onClick={() => {
                                  const section = sections[expandedSectionIndex!];
                                  if (section) {
                                    filterRelevantBlogs(
                                      section.title,
                                      typeof section.content === 'string' ? section.content : (section.contentHtml || '')
                                    );
                                  }
                                }}
                                className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium mb-2"
                              >
                                🔄 Refresh
                              </button>
                              
                              {publishedBlogs.length > 0 && (
                                <button
                                  onClick={() => generateAiLinkSuggestions(expandedSectionIndex!, publishedBlogs)}
                                  disabled={loadingAiSuggestions}
                                  className="w-full px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 font-medium"
                                >
                                  {loadingAiSuggestions ? "Analyzing..." : "✨ AI Suggestions"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2 mb-3">
                                {relevantBlogs.filter((blog: any) => blog && blog.title).slice(0, 3).map((blog, i) => (
                                  <div key={i} className="bg-white p-3 rounded border-l-4 border-l-green-500 border border-green-100 text-xs">
                                    <p className="font-medium text-gray-900 line-clamp-2 mb-1">
                                      {blog.title || blog.topic}
                                    </p>
                                    <p className="text-green-600 font-semibold text-xs mb-2">
                                      🎯 Score: {blog.relevanceScore || 0}
                                    </p>
                                    <button
                                      onClick={() => insertBlogLink(blog)}
                                      className="w-full px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                                    >
                                      ✓ Add
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              <button
                                onClick={() => insertTopLinksToSection(expandedSectionIndex!)}
                                disabled={countInternalLinksInSection(expandedSectionIndex!) >= internalLinksPerSection || relevantBlogs.length === 0}
                                className={`w-full px-2 py-2 text-xs rounded font-medium transition-colors text-sm mb-2 ${
                                  countInternalLinksInSection(expandedSectionIndex!) < internalLinksPerSection && relevantBlogs.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                ✓ Add All {Math.min(
                                  internalLinksPerSection - countInternalLinksInSection(expandedSectionIndex! || 0),
                                  relevantBlogs.length
                                )}
                              </button>
                              
                              <button
                                onClick={() => generateAiLinkSuggestions(expandedSectionIndex!, relevantBlogs)}
                                disabled={loadingAiSuggestions || relevantBlogs.length === 0}
                                className="w-full px-2 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 font-medium transition-colors text-sm"
                              >
                                {loadingAiSuggestions ? "Analyzing..." : "✨ Get AI Suggestions"}
                              </button>
                            </>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-xs font-semibold text-gray-900 mb-2">Link Settings</p>
                            <div className="space-y-3 bg-white p-3 rounded border border-blue-100 mb-3">
                              <label className="block">
                                <span className="block text-xs text-gray-700 font-medium mb-1">
                                  Internal links target
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={internalLinksPerSection}
                                    onChange={(e) => setInternalLinksPerSection(parseInt(e.target.value, 10) || 0)}
                                    className="flex-1"
                                  />
                                  <span className="w-8 text-xs font-semibold text-gray-700 text-right">
                                    {internalLinksPerSection}
                                  </span>
                                </div>
                              </label>
                              <label className="block">
                                <span className="block text-xs text-gray-700 font-medium mb-1">
                                  External links target
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={externalLinksPerSection}
                                    onChange={(e) => setExternalLinksPerSection(parseInt(e.target.value, 10) || 0)}
                                    className="flex-1"
                                  />
                                  <span className="w-8 text-xs font-semibold text-gray-700 text-right">
                                    {externalLinksPerSection}
                                  </span>
                                </div>
                              </label>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 mb-2">Link Count</p>
                            <div className="bg-white p-2 rounded border border-blue-100">
                              <p className="text-xs text-gray-700 font-medium">
                                {countInternalLinksInSection(expandedSectionIndex!)} / {internalLinksPerSection}
                              </p>
                            </div>
                          </div>

                          {/* External Links Management */}
                          <div className="mt-6 pt-6 border-t border-blue-200">
                            <h5 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                              🔗 External Source Links
                            </h5>
                            
                            {(() => {
                              const externalLinks = getExternalSectionLinks(sections[expandedSectionIndex]);
                              return (
                                <>
                                  {externalLinks.length > 0 ? (
                                    <div className="space-y-2 mb-3">
                                      {externalLinks.map((link, idx) => (
                                        <div key={idx} className="bg-white p-2 rounded border-l-2 border-l-blue-500 border border-blue-100 text-xs">
                                          <p className="text-gray-900 font-medium line-clamp-2 mb-1">
                                            {link.text}
                                          </p>
                                          <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-xs break-all hover:underline"
                                          >
                                            {link.url.substring(0, 40)}...
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-600 mb-3">
                                      No external source links found in this section yet.
                                    </p>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => generateAiExternalSuggestions(expandedSectionIndex!)}
                                      disabled={loadingExternalAiSuggestions}
                                      className="w-full px-2 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 font-medium transition-colors"
                                    >
                                      {loadingExternalAiSuggestions ? "Analyzing..." : "✨ AI Suggest Sources"}
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        setViewLinksMode(true);
                                      }}
                                      className="w-full px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                                    >
                                      👁️ View All Links
                                    </button>
                                  </div>

                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-xs font-semibold text-gray-900 mb-2">Link Count</p>
                                    <div className="bg-white p-2 rounded border border-blue-100">
                                      <p className="text-xs text-gray-700 font-medium">
                                        {externalLinks.length} external link{externalLinks.length !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex gap-3">
                    <button
                      onClick={() => {
                        setExpandedSectionIndex(null);
                        setViewLinksMode(false);
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setCurrentSectionIndex(expandedSectionIndex);
                        regenerateSection(expandedSectionIndex);
                        setExpandedSectionIndex(null);
                        setViewLinksMode(false);
                      }}
                      disabled={writingSection}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                    >
                      {writingSection ? "Regenerating..." : "Regenerate & Close"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Outline Section Image Preview Modal */}
            {viewingOutlineImageIndex !== null && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Section {viewingOutlineImageIndex + 1} - {editableOutline[viewingOutlineImageIndex]}
                    </h3>
                    <button
                      onClick={() => setViewingOutlineImageIndex(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6">
                    {(sections[viewingOutlineImageIndex]?.imageUrl || sectionImages[viewingOutlineImageIndex]) ? (
                      <img
                        src={sections[viewingOutlineImageIndex]?.imageUrl || sectionImages[viewingOutlineImageIndex]}
                        alt={editableOutline[viewingOutlineImageIndex]}
                        className="w-full rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                        No image generated yet for this section.
                      </div>
                    )}
                  </div>

                  {/* AI-Suggested Metadata */}
                  {sectionImageMetadata[viewingOutlineImageIndex] && (
                    <div className="p-6 border-t bg-blue-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">✨ AI-Suggested Metadata</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingOutlineImageIndex].altText}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingOutlineImageIndex].caption}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description (SEO)</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingOutlineImageIndex].description}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Keywords</label>
                          <div className="flex flex-wrap gap-2">
                            {sectionImageMetadata[viewingOutlineImageIndex].keywords.map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                    <button
                      onClick={() => setViewingOutlineImageIndex(null)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Written Section Image Preview Modal */}
            {viewingWrittenImageIndex !== null && sections[viewingWrittenImageIndex] && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Section {viewingWrittenImageIndex + 1} - {sections[viewingWrittenImageIndex]?.title}
                    </h3>
                    <button
                      onClick={() => setViewingWrittenImageIndex(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6">
                    {sections[viewingWrittenImageIndex]?.imageUrl ? (
                      <img
                        src={sections[viewingWrittenImageIndex].imageUrl}
                        alt={sections[viewingWrittenImageIndex]?.title}
                        className="w-full rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                        No image generated for this section.
                      </div>
                    )}
                  </div>

                  {/* AI-Suggested Metadata */}
                  {sectionImageMetadata[viewingWrittenImageIndex] && (
                    <div className="p-6 border-t bg-blue-50">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">✨ AI-Suggested Metadata</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingWrittenImageIndex].altText}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingWrittenImageIndex].caption}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description (SEO)</label>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                            {sectionImageMetadata[viewingWrittenImageIndex].description}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Keywords</label>
                          <div className="flex flex-wrap gap-2">
                            {sectionImageMetadata[viewingWrittenImageIndex].keywords.map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                    <button
                      onClick={() => setViewingWrittenImageIndex(null)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wix Post Preview - Display loaded post metadata & content */}
            {selectedDraft.status !== "draft" && selectedDraft.id?.startsWith('wix-') && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    📖 Loaded Wix Post
                    {editableTitle && <span className="text-base font-normal text-gray-600">- {editableTitle}</span>}
                  </h3>
                  <p className="text-sm text-gray-600">
                    🔗 <a href={selectedDraft.metadata?.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                      View on Wix
                    </a>
                  </p>
                </div>

                {/* Metadata Display */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-indigo-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</p>
                    <p className="text-gray-900 font-semibold mt-1">{editableTitle || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL Slug</p>
                    <p className="text-gray-900 font-mono text-sm mt-1">{editableSlug || "Not set"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Excerpt</p>
                    <p className="text-gray-700 mt-1 line-clamp-3">{editableExcerpt || "No excerpt"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mt-1">
                      ✓ Published
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</p>
                    <span className="inline-block px-3 py-1 text-xs font-semibold mt-1">
                      {selectedDraft.metadata?.featured ? (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⭐ Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Blog Outline */}
                {outline && outline.length > 0 && (
                  <div className="mb-6 bg-white p-4 rounded-lg border border-indigo-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">📋 Blog Outline ({outline.length} sections)</h4>
                    <ol className="space-y-2">
                      {outline.map((title, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-6">{idx + 1}.</span>
                          <span className="text-gray-700">{title}</span>
                          {sections[idx] && (
                            <span className="text-xs text-green-600 ml-auto">
                              ✓ {sections[idx].wordCount || 0} words
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Featured Image Preview */}
                {editableFeaturedImageUrl && (
                  <div className="mb-6 bg-white p-4 rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Featured Image</p>
                    <img 
                      src={editableFeaturedImageUrl} 
                      alt={editableTitle}
                      className="w-full h-48 object-cover rounded border border-gray-300"
                    />
                  </div>
                )}

                {/* Post Content Display - Show all sections */}
                {sections && sections.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-indigo-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 Post Content</h4>
                    <div className="prose prose-sm max-w-none space-y-6">
                      {sections.map((section, idx) => section && (
                        <div key={idx} className="section-content">
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {idx + 1}. {section.title}
                          </h2>
                          {section.contentHtml ? (
                            <div
                              className="text-gray-800 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                            />
                          ) : section.content && typeof section.content === 'string' ? (
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {section.content}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No content available for this section</p>
                          )}
                          {idx < sections.length - 1 && (
                            <hr className="my-8 border-gray-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Content Message */}
                {(!sections || sections.length === 0) && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      ⚠️ <strong>No content found in Wix post.</strong> 
                    </p>
                    <p className="text-sm text-amber-800 mt-2">
                      This is normal for Wix published posts - the Wix API returns plain text content only (contentText), not the full formatted content (richContent). 
                      The contentText field may be empty if the post was published without a detailed body.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata & Content Editor */}
            {selectedDraft.status !== "draft" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Post Details
                </h3>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editableSlug}
                      onChange={(e) => setEditableSlug(e.target.value)}
                      placeholder="url-friendly-slug"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt (Summary)
                    </label>
                    <textarea
                      value={editableExcerpt}
                      onChange={(e) => setEditableExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Featured Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Image URL (Optional)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={editableFeaturedImageUrl}
                        onChange={(e) => setEditableFeaturedImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={generateFeaturedImage}
                        disabled={generatingImage || !selectedDraft?.topic}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded lg hover:bg-purple-700 disabled:bg-gray-400 font-medium transition-colors"
                      >
                        {generatingImage ? "Generating Image..." : "Generate Image with AI"}
                      </button>
                      <button
                        onClick={() => {
                          const saved = localStorage.getItem("blog_image_prompt");
                          setCustomImagePrompt(saved || DEFAULT_IMAGE_PROMPT_TEMPLATE);
                          setShowImagePromptEditor(true);
                        }}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium transition-colors text-sm"
                      >
                        ⚙️ Edit Image Prompt
                      </button>
                      {generatedImageUrl && (
                        <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                          <p className="text-sm font-medium text-purple-900 mb-2">Generated Image Preview:</p>
                          <img 
                            src={generatedImageUrl} 
                            alt="Generated featured image" 
                            className="w-full h-auto rounded border border-purple-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SEO Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={editableSeoTitle}
                      onChange={(e) => setEditableSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      value={editableSeoDescription}
                      onChange={(e) => setEditableSeoDescription(e.target.value)}
                      rows={2}
                      placeholder="Meta description for search engines (160 chars)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Markdown Editor Toggle */}
                  <div>
                    <button
                      onClick={() => setShowMarkdownEditor(!showMarkdownEditor)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showMarkdownEditor ? "Hide" : "Show"} Markdown Editor
                    </button>
                  </div>

                  {/* Markdown Editor */}
                  {showMarkdownEditor && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Markdown Content
                        </label>
                        <textarea
                          value={editableContent}
                          onChange={(e) => setEditableContent(e.target.value)}
                          rows={15}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Live Preview
                        </label>
                        <div className="prose prose-sm max-w-none p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto section-content">
                          {editableContent && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: convertMarkdownToHtml(editableContent),
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Extras */}
            {selectedDraft.status === "assembled" && assembledBlog && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generated Extras
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm("Regenerate FAQs, checklist, and author's takeaway specific to your content? This will replace the current extras.")) {
                        regenerateExtras();
                      }
                    }}
                    disabled={regeneratingExtras}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:bg-gray-400"
                  >
                    {regeneratingExtras ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  ℹ️ These FAQs, checklist, and author takeaway are generated specifically from your blog content. Click "Regenerate" to create new content-specific versions.
                </p>
                <div className="space-y-6">
                  {/* FAQs */}
                  {assembledBlog.metadata?.faqs && assembledBlog.metadata.faqs.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Frequently Asked Questions</h4>
                        <button
                          onClick={() => {
                            if (confirm("Regenerate FAQs from your content?")) {
                              regenerateExtras("faqs");
                            }
                          }}
                          disabled={regeneratingSection === "faqs"}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {regeneratingSection === "faqs" ? "..." : "🔄"}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {assembledBlog.metadata.faqs.map((faq: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium text-gray-900">{faq.question}</p>
                            <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recovery Checklist */}
                  {assembledBlog.metadata?.checklist && assembledBlog.metadata.checklist.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Recovery Checklist</h4>
                        <button
                          onClick={() => {
                            if (confirm("Regenerate checklist from your content?")) {
                              regenerateExtras("checklist");
                            }
                          }}
                          disabled={regeneratingSection === "checklist"}
                          className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                        >
                          {regeneratingSection === "checklist" ? "..." : "🔄"}
                        </button>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {assembledBlog.metadata.checklist.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Outbound Links */}
                  {assembledBlog.metadata?.outboundLinks && assembledBlog.metadata.outboundLinks.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">
                          Sources & Further Reading
                        </h4>
                        <button
                          onClick={() => {
                            if (confirm("Regenerate sources from your content?")) {
                              regenerateExtras("links");
                            }
                          }}
                          disabled={regeneratingSection === "links"}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {regeneratingSection === "links" ? "..." : "🔄"}
                        </button>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {assembledBlog.metadata.outboundLinks.map((link: any, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-gray-500 mr-2">•</span>
                            <div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {link.title}
                              </a>
                              <p className="text-xs text-gray-500 mt-1">{link.url}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Author's Professional Takeaway */}
                  {selectedDraft.includeAuthorTakeaway !== false && (assembledBlog.metadata?.authorTakeaway || assembledBlog.authorTakeaway) && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Author's Professional Takeaway</h4>
                        <button
                          onClick={() => {
                            if (confirm("Regenerate the author's professional takeaway using AI?")) {
                              regenerateExtras("authorTakeaway");
                            }
                          }}
                          disabled={regeneratingSection === "authorTakeaway"}
                          className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                        >
                          {regeneratingSection === "authorTakeaway" ? "..." : "🔄"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 bg-purple-50 border border-purple-100 rounded p-3 italic">
                        {assembledBlog.metadata?.authorTakeaway || assembledBlog.authorTakeaway}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 flex-wrap">
                {canWriteSections && (
                  <>
                    {sections.length < editableOutline.length && (
                      <div>
                        <button
                          onClick={() => writeNextSection()}
                          disabled={writingSection}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                        >
                          {writingSection
                            ? "Writing Section..."
                            : `Write Section ${currentSectionIndex + 1}`}
                        </button>
                        {writingSection && (
                          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              <p className="text-sm text-blue-700 font-medium">
                                Writing "{editableOutline[currentSectionIndex]}"...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {sections.length > 0 && sections.length === editableOutline.length && (
                      <button
                        onClick={assembleBlog}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                      >
                        {loading ? "Assembling..." : "Assemble Blog"}
                      </button>
                    )}
                  </>
                )}

                {selectedDraft.status === "assembled" && (
                  <button
                    onClick={publishBlog}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {loading ? "Publishing..." : "Publish to Wix"}
                  </button>
                )}

                {selectedDraft.status === "published" && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-gray-700">
                      Published on{" "}
                      {selectedDraft.publishedAt &&
                        new Date(selectedDraft.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Source Detail Modal */}
        {selectedSourceForModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 pr-4">{selectedSourceForModal.title}</h2>
                  {selectedSourceForModal.source && (
                    <p className="text-sm text-gray-600 mt-1">Source: {selectedSourceForModal.source}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSourceForModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* URL */}
                {selectedSourceForModal.url && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">URL</h3>
                    <a
                      href={selectedSourceForModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 break-all text-sm"
                    >
                      {selectedSourceForModal.url}
                    </a>
                  </div>
                )}

                {/* Excerpt */}
                {(() => {
                  const excerpt = (selectedSourceForModal as any).excerpt || (selectedSourceForModal as any).snippet;
                  if (!excerpt) return null;
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Excerpt</h3>
                      <div className="max-h-96 overflow-y-auto bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {excerpt}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Full Body Content */}
                {selectedSourceForModal.bodyContent && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Content</h3>
                    <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedSourceForModal.bodyContent}
                      </p>
                    </div>
                  </div>
                )}

                {loadingSourceContent && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading full content...</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedSourceForModal.relevanceScore && (
                    <div>
                      <span className="text-gray-600">Relevance Score:</span>
                      <p className="font-medium text-gray-900">
                        {(selectedSourceForModal.relevanceScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                  {selectedSourceForModal.category && (
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium text-gray-900">{selectedSourceForModal.category}</p>
                    </div>
                  )}
                  {(selectedSourceForModal.author || selectedSourceForModal.expert) && (
                    <div>
                      <span className="text-gray-600">Author/Expert:</span>
                      <p className="font-medium text-gray-900">{selectedSourceForModal.author || selectedSourceForModal.expert}</p>
                    </div>
                  )}
                  {selectedSourceForModal.authority && (
                    <div>
                      <span className="text-gray-600">Authority Level:</span>
                      <p className="font-medium text-gray-900 capitalize">{selectedSourceForModal.authority}</p>
                    </div>
                  )}
                  {selectedSourceForModal.publication_date && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Published:</span>
                      <p className="font-medium text-gray-900">{selectedSourceForModal.publication_date}</p>
                    </div>
                  )}
                  {selectedSourceForModal.keywords && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Keywords:</span>
                      <p className="font-medium text-gray-900">{selectedSourceForModal.keywords}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (selectedSourceForModal.url) {
                      window.open(selectedSourceForModal.url, '_blank');
                    }
                  }}
                  disabled={!selectedSourceForModal.url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
                >
                  Open in Browser
                </button>
                <button
                  onClick={() => setSelectedSourceForModal(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Published Posts Tab */}
        {activeTab === "published" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Published Blog Posts</h2>
              <button
                onClick={loadWixPublishedPosts}
                disabled={loadingWixPosts}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium transition"
              >
                {loadingWixPosts ? "Loading..." : "🔄 Refresh Posts"}
              </button>
            </div>

            {wixPosts.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No published posts found. Create and publish a blog first.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {wixPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt || "No excerpt available"}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {post.publishedDate && (
                            <span>Published: {new Date(post.publishedDate).toLocaleDateString()}</span>
                          )}
                          {post.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadWixPostToEdit(post.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                        >
                          Edit
                        </button>
                        <a
                          href={`https://${process.env.NEXT_PUBLIC_WIX_DOMAIN}/blog/${post.slug || post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wix Published Posts Modal */}
        {showWixPostsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center sticky top-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  📝 Edit Published Blog
                </h3>
                <button
                  onClick={() => setShowWixPostsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-3">
                {wixPosts.length > 0 ? (
                  wixPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => loadWixPostToEdit(post.id)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-4">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Updated: {new Date(post.updatedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium whitespace-nowrap"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 py-8">
                    No published blogs found
                  </p>
                )}
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowWixPostsModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Prompt Editor Modal */}
        {showImagePromptEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Image Generation Prompt Editor</h2>
                <button
                  onClick={() => setShowImagePromptEditor(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Prompt Template
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    Use these variables: <code className="bg-gray-100 px-1 rounded">${'${sectionTitle}'}</code>, 
                    <code className="bg-gray-100 px-1 rounded ml-1">${'${topic}'}</code>, 
                    <code className="bg-gray-100 px-1 rounded ml-1">${'${contentPreview}'}</code>, 
                    <code className="bg-gray-100 px-1 rounded ml-1">${'${keywords}'}</code>
                  </p>
                  <textarea
                    value={customImagePrompt}
                    onChange={(e) => setCustomImagePrompt(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Create a professional, medical-illustration style image..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Preview (with actual values)
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {(() => {
                        // Get current section title from various contexts
                        let sectionTitle = "Your Section Title";
                        if (expandedSectionIndex !== null && sections[expandedSectionIndex]) {
                          sectionTitle = sections[expandedSectionIndex].title;
                        } else if (editableOutline && editableOutline.length > 0) {
                          sectionTitle = editableOutline[0];
                        }
                        
                        // Get content preview from current section if available
                        let contentPreview = "(no section content written yet)";
                        
                        // First, try expanded section
                        if (expandedSectionIndex !== null && sections[expandedSectionIndex]?.content) {
                          const content = typeof sections[expandedSectionIndex].content === 'string' 
                            ? sections[expandedSectionIndex].content 
                            : sections[expandedSectionIndex].contentHtml?.replace(/<[^>]*>/g, '') || '';
                          contentPreview = getPreviewText(content, 300);
                        } 
                        // Otherwise, try to find first section with content
                        else {
                          for (let i = 0; i < sections.length; i++) {
                            if (sections[i]?.content) {
                              const content = typeof sections[i].content === 'string' 
                                ? sections[i].content 
                                : sections[i].contentHtml?.replace(/<[^>]*>/g, '') || '';
                              if (content) {
                                contentPreview = getPreviewText(content, 300);
                                break;
                              }
                            }
                          }
                        }
                        
                        // Get keywords from research data
                        const keywords = (researchData?.keywords || []).slice(0, 5).join(", ") || "relevant, keywords, here";
                        
                        return customImagePrompt
                          .replace(/\$\{sectionTitle\}/g, sectionTitle)
                          .replace(/\$\{topic\}/g, selectedDraft?.topic || "Your Topic")
                          .replace(/\$\{contentPreview\}/g, contentPreview)
                          .replace(/\$\{keywords\}/g, keywords);
                      })()}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    ℹ️ <strong>Default prompt:</strong> Uses a professional medical-illustration style focused on clarity and educational value for physiotherapy content.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowImagePromptEditor(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setCustomImagePrompt(DEFAULT_IMAGE_PROMPT_TEMPLATE);
                    alert("✓ Reset to default prompt");
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("blog_image_prompt", customImagePrompt);
                    alert("✓ Prompt saved! It will be used for new image generations.");
                    setShowImagePromptEditor(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Detail Modal */}
        {selectedBlogForModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedBlogForModal.title || selectedBlogForModal.topic}
                    </h2>
                    {selectedBlogForModal.source && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedBlogForModal.source === 'wix' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedBlogForModal.source === 'wix' ? 'Wix Published Post' : 'Generated Blog'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={closeBlogModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Publication Info */}
                {selectedBlogForModal.updatedDate && (
                  <div className="text-sm text-gray-600">
                    <p>Published: {new Date(selectedBlogForModal.updatedDate).toLocaleDateString()}</p>
                  </div>
                )}

                {/* URL/Slug */}
                {(selectedBlogForModal.url || selectedBlogForModal.metadata?.slug) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">URL:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-blue-600 flex-1 break-all">
                        {selectedBlogForModal.url || `/${selectedBlogForModal.metadata?.slug}`}
                      </code>
                      <button
                        onClick={() => {
                          const url = selectedBlogForModal.url || `/${selectedBlogForModal.metadata?.slug}`;
                          navigator.clipboard.writeText(url);
                          alert('URL copied to clipboard!');
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex-shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Sections (for local blogs) */}
                {selectedBlogForModal.sections && selectedBlogForModal.sections.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Sections ({selectedBlogForModal.sections.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlogForModal.sections.map((section: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                        >
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Image */}
                {(selectedBlogForModal.metadata?.featuredImageUrl || selectedBlogForModal.featuredImage) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Featured Image</h3>
                    <img 
                      src={selectedBlogForModal.metadata?.featuredImageUrl || selectedBlogForModal.featuredImage}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Full Content (scrollable) */}
                {loadingBlogDetails || (selectedBlogForModal.source === 'wix' && !selectedBlogForModal.fullContent) ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading full content...</p>
                  </div>
                ) : selectedBlogForModal.fullContent && selectedBlogForModal.fullContent.length > 300 ? (
                  <div>
                    {/* Links Preview Section */}
                    {(() => {
                      const links = extractLinksFromContent(selectedBlogForModal.fullContent);
                      if (links.length > 0) {
                        return (
                          <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg mb-4">
                            <h3 className="font-bold text-blue-900 mb-2">🔗 External Links in this section:</h3>
                            <div className="flex flex-wrap gap-2">
                              {links.map((link, idx) => (
                                <span key={idx} className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                  {link}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <h3 className="font-semibold text-gray-900 mb-2">Full Content</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto text-sm text-gray-700 border border-gray-200 whitespace-pre-wrap break-words">
                      {renderContentWithHighlightedLinks(selectedBlogForModal.fullContent)}
                    </div>
                  </div>
                ) : (selectedBlogForModal.excerpt || selectedBlogForModal.fullContent) ? (
                  <div>
                    {/* Links Preview Section for Excerpt */}
                    {(() => {
                      const contentToCheck = selectedBlogForModal.fullContent || selectedBlogForModal.excerpt || '';
                      const links = extractLinksFromContent(contentToCheck);
                      if (links.length > 0) {
                        return (
                          <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg mb-4">
                            <h3 className="font-bold text-blue-900 mb-2">🔗 External Links in this section:</h3>
                            <div className="flex flex-wrap gap-2">
                              {links.map((link, idx) => (
                                <span key={idx} className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                  {link}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {selectedBlogForModal.fullContent && selectedBlogForModal.fullContent.length > 100 ? 'Preview' : 'Summary'}
                      {selectedBlogForModal.source === 'wix' && selectedBlogForModal.fullContent && selectedBlogForModal.fullContent.length < 300 && (
                        <span className="text-xs text-amber-600 ml-2">(full content not available in API)</span>
                      )}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto text-sm text-gray-700 border border-gray-200 whitespace-pre-wrap break-words">
                      {renderContentWithHighlightedLinks(selectedBlogForModal.fullContent || selectedBlogForModal.excerpt)}
                    </div>
                  </div>
                ) : null}

                {/* SEO Info */}
                {selectedBlogForModal.metadata?.seoTitle && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">SEO Title</h3>
                    <p className="text-sm text-gray-700">{selectedBlogForModal.metadata.seoTitle}</p>
                  </div>
                )}

                {selectedBlogForModal.metadata?.seoDescription && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">SEO Description</h3>
                    <p className="text-sm text-gray-700">{selectedBlogForModal.metadata.seoDescription}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between items-center gap-3">
                <button
                  onClick={() => {
                    const url = selectedBlogForModal.url || `/${selectedBlogForModal.metadata?.slug}`;
                    if (url) {
                      window.open(url, '_blank');
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  View Post
                </button>
                
                <button
                  onClick={() => {
                    if (currentSectionIndex < sections.length && sections[currentSectionIndex]) {
                      insertBlogLink(selectedBlogForModal);
                    } else {
                      alert("Please write a section first before adding internal links. Write at least the first section, then come back to link blogs.");
                    }
                  }}
                  disabled={currentSectionIndex >= sections.length || !sections[currentSectionIndex]}
                  className={`px-4 py-2 rounded-lg font-bold transition ${
                    currentSectionIndex < sections.length && sections[currentSectionIndex]
                      ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={currentSectionIndex < sections.length && sections[currentSectionIndex] 
                    ? `Add link to "${sections[currentSectionIndex].title}"` 
                    : 'Write a section first to enable linking'}
                >
                  ✓ Insert Link {currentSectionIndex < sections.length && sections[currentSectionIndex] ? `into "${sections[currentSectionIndex].title}"` : ''}
                </button>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => {
                      const url = selectedBlogForModal.url || `/${selectedBlogForModal.metadata?.slug}`;
                      if (url) {
                        navigator.clipboard.writeText(url);
                        alert('URL copied to clipboard!');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={closeBlogModal}
                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Link Suggestions Modal */}
        {showAiLinkModal && aiLinkSuggestions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">✨ AI Link Suggestions</h2>
                    <p className="text-purple-100 text-sm">Found {aiLinkSuggestions.length} natural link placement{aiLinkSuggestions.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => setShowAiLinkModal(false)}
                    className="text-white hover:text-purple-100 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {aiLinkSuggestions.map((suggestion, i) => {
                  const blog = relevantBlogs[suggestion.blogIndex];
                  if (!blog) return null;

                  return (
                    <div
                      key={i}
                      className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAiSuggestion(selectedAiSuggestion?.blogIndex === suggestion.blogIndex ? null : suggestion)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Suggestion {i + 1}
                            </span>
                            <span className="text-xs text-gray-600">
                              Confidence: {Math.round((suggestion.confidence || 0.7) * 100)}%
                            </span>
                          </div>
                          
                          <p className="font-semibold text-gray-900 mb-2">
                            Link to: <span className="text-purple-600">{blog.title || blog.topic}</span>
                          </p>
                          
                          <div className="bg-purple-50 p-3 rounded mb-2 border border-purple-100">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Anchor text:</span> &quot;{suggestion.anchorText}&quot;
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-semibold">Insert after:</span> &quot;{suggestion.insertAfterPhrase?.substring(0, 80)}{suggestion.insertAfterPhrase?.length > 80 ? '...' : ''}&quot;
                            </p>
                          </div>

                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Why:</span> {suggestion.reason}
                          </p>
                          
                          {blog.relevanceScore && (
                            <p className="text-xs text-green-600 font-medium mt-2">
                              🎯 Relevance Score: {blog.relevanceScore}
                            </p>
                          )}
                        </div>
                      </div>

                      {selectedAiSuggestion?.blogIndex === suggestion.blogIndex && (
                        <div className="mt-4 pt-4 border-t border-purple-200 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyAiSuggestion(suggestion, expandedSectionIndex!);
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm transition-colors"
                          >
                            ✓ Apply Link
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAiSuggestion(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAiLinkModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
