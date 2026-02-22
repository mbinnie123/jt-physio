import axios, { AxiosInstance } from "axios";
import { BlogPost } from "./assembler";

const WIX_API_BASE = "https://www.wixapis.com";

export interface WixPublishOptions {
  existingPostId?: string | null;
}

export interface WixPublishResult {
  action: "created" | "updated";
  postId: string;
  draftId?: string;
  url?: string;
}

interface WixTextStyle {
  textAlignment?: "AUTO" | "LEFT" | "CENTER" | "RIGHT" | "JUSTIFY";
}

interface WixRichTextNode {
  id: string;
  type: string;
  nodes?: WixRichTextNode[];
  headingData?: {
    level: number;
    textStyle?: WixTextStyle;
  };
  paragraphData?: {
    textStyle?: WixTextStyle;
    indentation?: number | null;
    level?: number | null;
  };
  textData?: {
    text: string;
    decorations: Array<Record<string, unknown>>;
  };
  linkData?: {
    link?: {
      url?: string;
      target?: "_blank" | "_self";
    };
  };
  imageData?: {
    image?: {
      src?: {
        url: string;
      };
    };
    altText?: string;
  };
}

interface WixDraftPostPayload {
  title: string;
  slug?: string;
  authorId: string;
  memberId: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
  featured?: boolean;
  richContent: {
    nodes: WixRichTextNode[];
    metadata: {
      version: number;
    };
    documentStyle: Record<string, unknown>;
  };
  seoData?: {
    title?: string;
    description?: string;
  };
}

class WixPublisher {
  private client: AxiosInstance;
  private authorId: string;

  constructor() {
    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID;
    const authorId = process.env.WIX_AUTHOR_MEMBER_ID;

    if (!apiKey || !siteId || !authorId) {
      throw new Error(
        "Missing Wix configuration. Ensure WIX_API_KEY, WIX_SITE_ID, and WIX_AUTHOR_MEMBER_ID are set."
      );
    }

    this.authorId = authorId;
    this.client = axios.create({
      baseURL: WIX_API_BASE,
      timeout: 15000,
      headers: {
        Authorization: apiKey,
        "wix-site-id": siteId,
        "Content-Type": "application/json",
      },
    });
  }

  async publish(post: BlogPost, options: WixPublishOptions = {}): Promise<WixPublishResult> {
    if (options.existingPostId) {
      return this.updateExistingPost(post, options.existingPostId);
    }

    return this.createAndPublishPost(post);
  }

  private async createAndPublishPost(post: BlogPost): Promise<WixPublishResult> {
    const payload = buildDraftPayload(post, this.authorId);

    console.log("[wix-publisher] Creating draft post...");
    const draftResponse = await this.client.post("/blog/v3/draft-posts", {
      draftPost: payload,
    });
    
    console.log("[wix-publisher] Draft created successfully");
    const draftId = draftResponse.data?.draftPost?.id;

    if (!draftId) {
      throw new Error("Wix API did not return a draft ID");
    }

    console.log("[wix-publisher] Publishing draft with ID:", draftId);
    const publishResponse = await this.client.post(
      `/blog/v3/draft-posts/${draftId}/publish`
    );

    console.log("[wix-publisher] Post published successfully");
    const publishedPost = publishResponse.data?.post;
    const postId = publishedPost?.id || publishResponse.data?.postId;
    let url = extractPostUrl(publishedPost);

    if (!postId) {
      throw new Error("Wix API did not return a published post ID");
    }

    if (!url) {
      url = await this.fetchPostUrl(postId);
    }

    return {
      action: "created",
      postId,
      draftId,
      url,
    };
  }

  private async updateExistingPost(
    post: BlogPost,
    postId: string
  ): Promise<WixPublishResult> {
    const payload = buildDraftPayload(post, this.authorId);
    const response = await this.client.patch(`/blog/v3/posts/${postId}`, {
      post: payload,
    });

    const updatedPost = response.data?.post;
    const updatedId = updatedPost?.id || response.data?.postId || postId;
    let url = extractPostUrl(updatedPost);

    if (!url) {
      url = await this.fetchPostUrl(updatedId);
    }

    return {
      action: "updated",
      postId: updatedId,
      url,
    };
  }

  private async fetchPostUrl(postId: string): Promise<string | undefined> {
    try {
      const response = await this.client.get(`/blog/v3/posts/${postId}`);
      const post = response.data?.post;
      return extractPostUrl(post);
    } catch (error) {
      console.warn("[wix-publisher] Failed to fetch post URL", {
        postId,
        error: axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              message:
                error.response?.data?.message || error.response?.statusText,
            }
          : (error as Error)?.message,
      });
      return undefined;
    }
  }
}

let publisherInstance: WixPublisher | null = null;

function getPublisher(): WixPublisher {
  if (!publisherInstance) {
    publisherInstance = new WixPublisher();
  }
  return publisherInstance;
}

export async function publishToWix(
  post: BlogPost,
  options: WixPublishOptions = {}
): Promise<WixPublishResult> {
  try {
    const publisher = getPublisher();
    
    if (!post.featuredImageUrl) {
      throw new Error(
        "Featured image is required before publishing. Generate or upload one before continuing."
      );
    }

    // Use GCS URL directly as coverMedia. Wix will fetch and display it.
    console.log("[publishToWix] Using GCS URL for featured image:", post.featuredImageUrl);
    
    return await publisher.publish(post, options);
  } catch (error) {
    throw normalizeWixError(error);
  }
}

function buildDraftPayload(post: BlogPost, authorId: string): WixDraftPostPayload {
  const payload: WixDraftPostPayload = {
    title: post.title,
    slug: post.slug,
    authorId,
    memberId: authorId,
    excerpt: post.excerpt,
    tags: (post.seoKeywords || []).slice(0, 10),
    category: post.metadata?.category,
    featured: post.metadata?.featured,
    published: false,
    richContent: buildRichContent(post),
    seoData: {
      title: post.seoTitle,
      description: post.seoDescription,
    },
  };

  // Note: Featured images are now embedded as IMAGE nodes in richContent (not coverMedia)
  // This is because Wix ignores the coverMedia field but preserves IMAGE nodes

  console.log("[buildDraftPayload] Building draft for:", post.title);
  if (post.featuredImageUrl) {
    console.log("[buildDraftPayload] Featured image will be added as first content node:", post.featuredImageUrl);
  }

  return payload;
}

function normalizeFeaturedImageUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  let normalized = url.trim();

  const cloudConsolePrefix = "https://storage.cloud.google.com/";
  if (normalized.startsWith(cloudConsolePrefix)) {
    normalized = normalized.replace(
      cloudConsolePrefix,
      "https://storage.googleapis.com/"
    );
  }

  if (normalized.startsWith("gs://")) {
    const withoutScheme = normalized.substring(5); // remove gs://
    const firstSlash = withoutScheme.indexOf("/");
    if (firstSlash > 0) {
      const bucket = withoutScheme.substring(0, firstSlash);
      const objectPath = withoutScheme.substring(firstSlash + 1);
      normalized = `https://storage.googleapis.com/${bucket}/${objectPath}`;
    }
  }

  return normalized;
}

let nodeIdCounter = 0;

function nextNodeId(prefix: string): string {
  nodeIdCounter = (nodeIdCounter % 1_000_000) + 1;
  return `${prefix}-${Date.now()}-${nodeIdCounter}`;
}

function buildRichContent(post: BlogPost): {
  nodes: WixRichTextNode[];
  metadata: { version: number };
  documentStyle: Record<string, unknown>;
} {
  const nodes: WixRichTextNode[] = [];

  // Add featured image as the first node if it exists
  // This is more reliable than coverMedia which Wix ignores
  if (post.featuredImageUrl) {
    const normalizedUrl = normalizeFeaturedImageUrl(post.featuredImageUrl);
    if (normalizedUrl) {
      nodes.push(createImageNode(normalizedUrl, post.title || "Featured image"));
    }
  }

  post.sections.forEach((section, index) => {
    // Skip heading for first section if it matches the post title (to avoid duplication)
    const isFirstSection = index === 0;
    const titleMatches = post.title && section.title.toLowerCase().trim() === post.title.toLowerCase().trim();
    
    if (!(isFirstSection && titleMatches)) {
      nodes.push(createHeadingNode(section.title, 2));
    }

    // Handle both Ricos format (object) and legacy string format
    if (section.content && typeof section.content === 'object' && section.content.nodes) {
      // Content is already in Ricos format - convert to Wix nodes
      const ricosNodes = convertRicosToWixNodes(section.content.nodes);
      nodes.push(...ricosNodes);
    } else if (typeof section.content === 'string') {
      // Legacy string format - parse with subheadings
      const contentNodes = parseContentWithSubheadings(section.content);
      nodes.push(...contentNodes);
    }
  });

  if (post.faqs?.length) {
    nodes.push(createHeadingNode("Frequently Asked Questions", 2));

    post.faqs.forEach((faq) => {
      nodes.push(createHeadingNode(faq.question, 3));
      nodes.push(createParagraphNode(faq.answer));
    });
  }

  if (post.checklist?.length) {
    nodes.push(createHeadingNode("Recovery Checklist", 2));
    post.checklist.forEach((item) => {
      nodes.push(createParagraphNode(item));
    });
  }

  if (post.outboundLinks?.length) {
    nodes.push(createHeadingNode("Sources & Further Reading", 2));
    const sourceListItems = post.outboundLinks
      .map((link) => {
        const childNodes: WixRichTextNode[] = [];
        const descriptor = link.source || extractHostname(link.url);

        if (descriptor) {
          childNodes.push(createTextNode(`${descriptor}: `));
        }

        if (link.url) {
          const label = link.title?.trim() || link.url;
          childNodes.push(createLinkNode(label, link.url));
        } else if (link.title) {
          childNodes.push(createTextNode(link.title));
        }

        return childNodes.length ? createListItemNode(childNodes) : null;
      })
      .filter((item): item is WixRichTextNode => Boolean(item));

    if (sourceListItems.length) {
      nodes.push(createBulletedListNode(sourceListItems));
    }
  }

  return {
    nodes,
    metadata: { version: 1 },
    documentStyle: {},
  };
}

function createHeadingNode(text: string, level: number): WixRichTextNode {
  return {
    id: nextNodeId("heading"),
    type: "HEADING",
    headingData: {
      level,
      textStyle: { textAlignment: "AUTO" },
    },
    nodes: [createTextNode(text)],
  };
}

function createParagraphNode(text: string): WixRichTextNode {
  return {
    id: nextNodeId("paragraph"),
    type: "PARAGRAPH",
    paragraphData: {
      textStyle: { textAlignment: "AUTO" },
      indentation: null,
      level: null,
    },
    nodes: [createTextNode(text)],
  };
}

function createParagraphNodeFromNodes(childNodes: WixRichTextNode[]): WixRichTextNode {
  return {
    id: nextNodeId("paragraph"),
    type: "PARAGRAPH",
    paragraphData: {
      textStyle: { textAlignment: "AUTO" },
      indentation: null,
      level: null,
    },
    nodes: childNodes,
  };
}

function createTextNode(text: string, link?: { url: string; target?: string }): WixRichTextNode {
  const decorations: Array<Record<string, unknown>> = [];
  
  if (link) {
    decorations.push({
      type: "LINK",
      linkData: {
        link: {
          url: link.url,
          target: "BLANK",
        },
      },
    });
  }

  return {
    id: nextNodeId("text"),
    type: "TEXT",
    nodes: [],
    textData: {
      text: sanitizeText(text),
      decorations,
    },
  };
}

function createLinkNode(text: string, url: string): WixRichTextNode {
  return createTextNode(text, { url, target: "BLANK" });
}

function createImageNode(url: string, altText?: string): WixRichTextNode {
  return {
    id: nextNodeId("image"),
    type: "IMAGE",
    imageData: {
      image: {
        src: {
          url: url,
        },
      },
      altText: altText || "Image",
    },
  };
}

function createListItemNode(childNodes: WixRichTextNode[]): WixRichTextNode {
  return {
    id: nextNodeId("list-item"),
    type: "LIST_ITEM",
    nodes: [createParagraphNodeFromNodes(childNodes)],
  };
}

function createBulletedListNode(items: WixRichTextNode[]): WixRichTextNode {
  return {
    id: nextNodeId("bulleted-list"),
    type: "BULLETED_LIST",
    nodes: items,
  };
}

/**
 * Convert Ricos nodes to Wix rich text nodes
 */
function convertRicosToWixNodes(ricosNodes: any[]): WixRichTextNode[] {
  const wixNodes: WixRichTextNode[] = [];

  for (const ricoNode of ricosNodes) {
    if (ricoNode.type === "heading") {
      // Heading node - extract text from child nodes
      const text = extractTextFromRicosNodes(ricoNode.nodes);
      wixNodes.push(createHeadingNode(text, ricoNode.level || 3));
    } else if (ricoNode.type === "paragraph") {
      // Paragraph node - convert inline nodes
      const wixInlineNodes: WixRichTextNode[] = [];
      
      for (const inlineNode of ricoNode.nodes || []) {
        if (inlineNode.type === "text") {
          wixInlineNodes.push({
            id: nextNodeId("text"),
            type: "TEXT",
            textData: {
              text: inlineNode.data || "",
              decorations: [],
            },
          });
        } else if (inlineNode.type === "link") {
          // Use createTextNode with link parameter to get the correct structure
          const linkText = extractTextFromRicosNodes(inlineNode.nodes || []);
          wixInlineNodes.push(
            createTextNode(linkText, {
              url: inlineNode.href,
              target: inlineNode.target || "_blank",
            })
          );
        }
      }

      if (wixInlineNodes.length > 0) {
        wixNodes.push({
          id: nextNodeId("paragraph"),
          type: "PARAGRAPH",
          nodes: wixInlineNodes,
        });
      }
    }
  }

  return wixNodes;
}

/**
 * Extract plain text from Ricos nodes
 */
function extractTextFromRicosNodes(ricosNodes: any[]): string {
  let text = "";
  for (const node of ricosNodes || []) {
    if (node.type === "text") {
      text += node.data || "";
    } else if (node.nodes) {
      text += extractTextFromRicosNodes(node.nodes);
    }
  }
  return text;
}

function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseContentWithSubheadings(content: string): WixRichTextNode[] {
  const nodes: WixRichTextNode[] = [];
  
  // Pattern to match [H3]Title[/H3] - using 's' flag to match newlines in content
  const h3Pattern = /\[H3\](.*?)\[\/H3\]/gis;
  
  // Split content by h3 tags
  const parts = content.split(h3Pattern);
  
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    
    // If this is an h3 title (odd indices after split are the captured groups)
    if (i % 2 === 1) {
      const h3Title = part.trim();
      if (h3Title) {
        nodes.push(createHeadingNode(h3Title, 3));
      }
      i++;
      continue;
    }
    
    // Regular content part
    if (part && part.trim()) {
      const paragraphs = splitIntoParagraphs(part);
      paragraphs.forEach((para) => {
        if (para) {
          nodes.push(createParagraphWithLinks(para));
        }
      });
    }
    i++;
  }
  
  return nodes;
}

/**
 * Create a paragraph node that supports markdown links [text](url)
 */
function createParagraphWithLinks(text: string): WixRichTextNode {
  const childNodes: WixRichTextNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      childNodes.push(createTextNode(beforeText));
    }

    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    childNodes.push(
      createTextNode(linkText, {
        url: linkUrl,
        target: "_blank",
      })
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last link
  if (lastIndex < text.length) {
    const afterText = text.slice(lastIndex);
    childNodes.push(createTextNode(afterText));
  }

  // If no links were found, just create a simple text node
  if (childNodes.length === 0) {
    childNodes.push(createTextNode(text));
  }

  return createParagraphNodeFromNodes(childNodes);
}

function sanitizeText(text: string): string {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHostname(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function extractPostUrl(post?: any): string | undefined {
  if (!post) return undefined;
  if (post.url) return post.url;
  if (post.link?.href) return post.link.href;
  return undefined;
}

function normalizeWixError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const wixMessage =
      (error.response?.data &&
        (error.response.data.message || error.response.data.detail)) ||
      error.message;

    const hint = deriveHintFromStatus(status);
    const composed = status
      ? `Wix API ${status}: ${wixMessage}${hint ? ` - ${hint}` : ""}`
      : `Wix API error: ${wixMessage}`;

    return new Error(composed);
  }

  return error instanceof Error ? error : new Error("Unknown Wix error");
}

function deriveHintFromStatus(status?: number): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case 401:
      return "Check WIX_API_KEY";
    case 403:
      return "Verify Wix API permissions";
    case 404:
      return "Ensure Wix Blog app is installed";
    default:
      return undefined;
  }
}