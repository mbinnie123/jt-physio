// Simple in-memory database for blog drafts and publishing status
// In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), ".blog-db.json");

export interface BlogMetadata {
  // Core fields
  title: string;
  slug: string;
  excerpt: string;
  
  // SEO fields
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  
  // Image and media
  featuredImageUrl?: string;
  
  // Publishing info
  author: string;
  publishDate: string;
  readTime: number;
  category: string;
  featured: boolean;
  
  // Generated content
  faqs: Array<{ question: string; answer: string }>;
  checklist: string[];
  outboundLinks: Array<{ title: string; url: string; source: string }>;
}

export interface BlogDraft {
  id: string;
  topic: string;
  location?: string; // Location (e.g., "Kilmarnock, Ayrshire")
  sport?: string; // Sport (e.g., "Football, Tennis")
  status: "draft" | "writing" | "assembled" | "published";
  sections: any[];
  metadata: BlogMetadata;
  researchData: any;
  selectedSourceIds: string[]; // Track which sources are selected for use
  includeChecklist?: boolean;
  includeFaq?: boolean;
  includeInternalCta?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  wixPostId?: string;
}

class BlogDatabase {
  private drafts: Map<string, BlogDraft> = new Map();
  private idCounter = 1;
  private initialized = false;

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(data);
        this.drafts = new Map(parsed.drafts || []);
        this.idCounter = parsed.idCounter || 1;
        this.initialized = true;
      }
    } catch (error) {
      console.warn("[DB] Failed to load from file, starting fresh:", error);
    }
  }

  private saveToFile() {
    try {
      const data = {
        drafts: Array.from(this.drafts.entries()),
        idCounter: this.idCounter,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("[DB] Failed to save to file:", error);
    }
  }

  generateId(): string {
    return `blog_${Date.now()}_${this.idCounter++}`;
  }

  createDraft(topic: string): BlogDraft {
    const id = this.generateId();
    const draft: BlogDraft = {
      id,
      topic,
      status: "draft",
      sections: [],
      metadata: {
        title: topic,
        slug: this.generateSlug(topic),
        excerpt: "",
        seoTitle: topic,
        seoDescription: "",
        seoKeywords: [],
        author: "JT Physiotherapy",
        publishDate: new Date().toISOString().split("T")[0],
        readTime: 0,
        category: "Health & Wellness",
        featured: false,
        faqs: [],
        checklist: [],
        outboundLinks: [],
      },
      researchData: null,
      selectedSourceIds: [], // Initialize empty source selection
      includeChecklist: true,
      includeFaq: true,
      includeInternalCta: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.drafts.set(id, draft);
    this.saveToFile();
    return draft;
  }

  private generateSlug(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  getDraft(id: string): BlogDraft | null {
    return this.drafts.get(id) || null;
  }

  getAllDrafts(): BlogDraft[] {
    return Array.from(this.drafts.values());
  }

  updateDraft(id: string, updates: Partial<BlogDraft>): BlogDraft | null {
    const draft = this.drafts.get(id);
    if (!draft) return null;

    const updated: BlogDraft = {
      ...draft,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.drafts.set(id, updated);
    this.saveToFile();
    return updated;
  }

  deleteDraft(id: string): boolean {
    const result = this.drafts.delete(id);
    if (result) {
      this.saveToFile();
    }
    return result;
  }

  getDraftsByStatus(status: BlogDraft["status"]): BlogDraft[] {
    return Array.from(this.drafts.values()).filter(
      (draft) => draft.status === status
    );
  }

  getPublishedPosts(): BlogDraft[] {
    return this.getDraftsByStatus("published");
  }

  getInProgressDrafts(): BlogDraft[] {
    return Array.from(this.drafts.values()).filter(
      (draft) => draft.status !== "published"
    );
  }
}

// Export singleton instance
export const blogDatabase = new BlogDatabase();
