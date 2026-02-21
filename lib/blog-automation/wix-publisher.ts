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
  coverMedia?: {
    image: {
      url: string;
    };
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

    const draftResponse = await this.client.post("/blog/v3/draft-posts", {
      draftPost: payload,
    });
    const draftId = draftResponse.data?.draftPost?.id;

    if (!draftId) {
      throw new Error("Wix API did not return a draft ID");
    }

    const publishResponse = await this.client.post(
      `/blog/v3/draft-posts/${draftId}/publish`
    );

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
      return extractPostUrl(response.data?.post);
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

  if (post.featuredImageUrl) {
    payload.coverMedia = {
      image: {
        url: post.featuredImageUrl,
      },
    };
  }

  return payload;
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

  post.sections.forEach((section) => {
    nodes.push(createHeadingNode(section.title, 2));

    const paragraphChunks = splitIntoParagraphs(section.content);
    paragraphChunks.forEach((chunk) => {
      nodes.push(createParagraphNode(chunk));
    });
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
    post.outboundLinks.forEach((link) => {
      const text = `${link.title} (${link.url})`;
      nodes.push(createParagraphNode(text));
    });
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

function createTextNode(text: string): WixRichTextNode {
  return {
    id: nextNodeId("text"),
    type: "TEXT",
    nodes: [],
    textData: {
      text: sanitizeText(text),
      decorations: [],
    },
  };
}

function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function sanitizeText(text: string): string {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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