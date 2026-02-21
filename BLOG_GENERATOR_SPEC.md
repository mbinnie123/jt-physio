# Blog Generator System - Implementation Spec

## Overview
A web-based admin tool that helps editors generate medically-informed blog posts from keywords/topics, review/edit them, and publish to Wix Blog.

---

## Core User Flow

1. **Admin enters topic/seed keyword** → Research button
2. **Tool runs research** → Returns structured notes + sources + outline
3. **Tool generates article in sections** → Multiple calls for quality + reliability
4. **Tool assembles sections** into full post with:
   - Title, slug, excerpt
   - SEO meta title + description
   - Body content in Markdown
   - FAQs + checklist
   - Optional featured image URL
   - Outbound links list (transparency)
5. **Admin can edit all fields** and Markdown in place
6. **Admin clicks Publish** → System converts Markdown → Wix Rich Content, publishes
7. **System publishes to Wix** with optional cover image upload

---

## Admin UI Features

### Blog Generator Dashboard
- **Topic input** (seed keyword) with optional context
- **Status indicators** + logs (loading, error, success)
- **Admin password/secret** entry (guards publish endpoints)

### Multi-Step Generation Controls
- **Research button** → Conducts research, returns sources + outline
- **Generate draft button** → Triggers write-section calls + assemble
- **Write section buttons** → Sequential section generation
- **Assemble button** → Combines sections into full post object
- **Publish button** → Publishes to Wix

### Editable Outputs
When post is in "assembled" status, admin can edit:
- **Title** (post name)
- **Slug** (URL-friendly identifier)
- **Excerpt** (summary/preview text)
- **Featured image URL** (optional)
- **SEO meta title** (search engine title)
- **SEO meta description** (search engine description)
- **Markdown editor** with live preview
  - Full content editing capability
  - Live HTML preview panel
  - Support for: headings, paragraphs, bold, italic, links, lists

### Generated Extras (Read-Only Display)
- **FAQ list** (Q/A pairs auto-generated from content)
- **Recovery Checklist** (action items for patient)
- **Outbound links list** (all sources used, for transparency)

### Draft List
- View all drafts
- Status badges (draft/writing/assembled/published)
- Quick access to load and continue editing

---

## Backend API Features

### Endpoints

#### `POST /api/blog/research`
**Input:**
```json
{
  "topic": "Neck Pain Management"
}
```

**Output:**
```json
{
  "success": true,
  "draft": { /* BlogDraft object */ },
  "research": {
    "topic": "Neck Pain Management",
    "keywords": ["neck", "pain", "physiotherapy"],
    "sources": [{ "title": "...", "url": "...", "content": "...", "relevanceScore": 0.95 }]
  },
  "outline": ["Introduction", "Causes", "Treatment Options", "Exercises", "Prevention"]
}
```

#### `POST /api/blog/write-section`
**Input:**
```json
{
  "draftId": "blog_123456_1",
  "sectionTitle": "Treatment Options",
  "sectionNumber": 3,
  "tone": "professional",
  "targetAudience": "physiotherapy patients"
}
```

**Output:**
```json
{
  "section": {
    "title": "Treatment Options",
    "content": "Markdown content here...",
    "wordCount": 350
  }
}
```

#### `POST /api/blog/publish`
**Input:**
```json
{
  "draftId": "blog_123456_1",
  "metadata": {
    "title": "Complete Guide to Neck Pain Management",
    "slug": "neck-pain-management-guide",
    "excerpt": "...",
    "seoTitle": "...",
    "seoDescription": "...",
    "featuredImageUrl": "https://..."
  },
  "content": "Markdown content..."
}
```

**Output:**
```json
{
  "success": true,
  "draft": { /* Updated BlogDraft */ },
  "url": "https://jt-physiotherapy.wix.com/blog/neck-pain-management-guide",
  "wixPostId": "12345"
}
```

### Error Handling
- Safe JSON parsing with retry logic
- Union-safe return types: `{ res, json } | { res, error, rawText }`
- Clean error propagation to UI
- Graceful handling of non-JSON responses (HTML error pages, timeouts)

---

## Data Models

### BlogMetadata
```typescript
interface BlogMetadata {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  featuredImageUrl?: string;
  author: string;
  publishDate: string;
  readTime: number;
  category: string;
  featured: boolean;
  faqs: Array<{ question: string; answer: string }>;
  checklist: string[];
  outboundLinks: Array<{ title: string; url: string; source: string }>;
}
```

### BlogPost (Assembled)
```typescript
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  featuredImageUrl?: string;
  content: string;  // Markdown
  sections: BlogSection[];
  faqs: FAQ[];
  checklist: string[];
  outboundLinks: Link[];
  metadata: { author, publishDate, readTime, category, featured };
  researchData?: ResearchData;
}
```

---

## Wix Publishing Layer

### Key Details
- **Slug sanitization**: lowercase, hyphens, strips invalid chars
- **Cover image import**: non-fatal (publish continues if import fails)
- **Clean field omission**:
  - Don't send empty arrays for tag/category IDs
  - Omit undefined values instead of passing nulls
- **Markdown → Ricos conversion**: Converts Markdown body to Wix rich content format
- **Error surfacing**: Returns wixStatus, wixRequestId, response body for debugging

---

## Public Site Rendering (Next.js)

### Content Support
Blog page supports multiple content shapes:
- **Wix rich content JSON** (Ricos) → converted to HTML
- **Raw HTML body**
- **Markdown body** (fallback)

### Content Conversion
- `resolveWixMediaUrl()`: Converts `wix:image://` → HTTPS URLs
- `ricosToHtml()`: Converts Ricos nodes:
  - Headings, paragraphs
  - Bulleted/ordered lists
  - Links, images, captions
  - Inline: bold, italic, underline, code, strikethrough
- `normaliseHtmlContent()`: Smart detection - uses HTML if present, falls back to Ricos, then Markdown
- `extractMarkdownContent()`: Reliable Markdown detection, avoids misclassifying HTML as Markdown

### Styling (Scoped)
- Uses **Tailwind Typography** (prose class) for consistent blog typography
- **Scoped CSS module** (`blog-content.module.css`):
  - Enforces list markers
  - Fixes `<li>` display
  - Bold (`strong`) weight
  - Italic (`em`) styling
  - Link underlines
- Prevents unintended styling of other pages

### SEO Metadata
- `generateMetadata()` pulls title + excerpt from Wix post
- Sets proper page `<head>` metadata

---

## Security & Access Control

- **Admin publish route**: Protected by Bearer token (`ADMIN_PASSWORD`)
- **Wix sync route**: Protected by `x-blog-sync-secret` header
- **Markdown rendering**: Uses `rehype-sanitize` for safe rendering
- **External links**: Open in new tabs with `noopener noreferrer`

---

## What's Already Implemented

✅ Multi-step blog generation (research → outline → write sections → assemble → publish)
✅ Admin dashboard with tab navigation
✅ Real-time outline generation
✅ Vertex AI Search integration (primary research source)
✅ Medical source fallback (NHS, Mayo Clinic, Cleveland Clinic, APTA, Johns Hopkins)
✅ SEO metadata generation
✅ FAQ auto-generation
✅ Checklist generation
✅ Outbound links tracking
✅ Draft persistence (in-memory, ready for DB upgrade)
✅ Wix publishing integration
✅ Authentication & access control

---

## Next Steps / Future Enhancements

1. **Database upgrade**: Replace in-memory Map with PostgreSQL/MongoDB
2. **Cover image handling**: Auto-fetch or user-uploaded image processing
3. **Rich Markdown editor**: Add rich text editor UI (vs textarea)
4. **Publish schedule**: Allow scheduling posts for future publication
5. **Analytics**: Track post performance (views, engagement)
6. **Version history**: Store draft revisions
7. **Collaboration**: Multi-user editing with comments
8. **Template system**: Blog post templates for different content types

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI/Research**: OpenAI GPT-4, Google Vertex AI Search, Google Custom Search
- **Publishing**: Wix Blog API
- **Database**: In-memory (in MVP; ready for upgrade)
- **Authentication**: Bearer token + password
- **Rendering**: Markdown, Ricos (Wix rich content), HTML

---

## Environment Variables Required

```
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=...
GOOGLE_CSE_API_KEY=...
GOOGLE_CSE_CX=...
WIX_API_KEY=...
WIX_SITE_ID=...
GCP_PROJECT_ID=jt-football-physiotherapy
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=...
VERTEX_ENGINE_ID=blog-generator-app_1771437328841
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...
```

---

Generated: February 20, 2026
Last Updated: Blog Generator Enhancement v2 (Editable Metadata + Markdown Editor)
