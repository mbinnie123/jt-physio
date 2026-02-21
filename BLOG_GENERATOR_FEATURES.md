# JT Physiotherapy Blog Generator - Features Overview

## System Architecture

The blog generator is a **structured, research-driven content production system** that transforms a seed keyword into a fully assembled, publish-ready blog post without requiring manual title or URL creation.

### Core Pipeline

```
Seed Keyword → Research → Outline → Write Sections → Assemble → Publish
```

---

## 1. Research Phase

**Objective:** Gather authoritative context and sources

### Features:
- ✅ **Multi-source research orchestration** - Attempts Vertex Search first, falls back to Google Custom Search, then mock medical sources
- ✅ **Vertex AI Search Integration** - Queries indexed medical documents (22+ sources)
- ✅ **Source accumulation** - Gather multiple research passes without losing previous sources
- ✅ **Source selection UI** - Checkbox interface to select which sources to use
- ✅ **Custom search queries** - Input field to search for specific related topics
- ✅ **Duplicate detection** - Prevents duplicate sources when researching more
- ✅ **Keyword extraction** - Automatically extracts 5 most relevant keywords from topic

### API Endpoint:
```
POST /api/blog/research
- Input: topic, draftId (optional), researchMore (optional)
- Output: sources[], keywords[], locationInfo
```

---

## 2. Outline Generation

**Objective:** Create structured JSON outline before writing

### Features:
- ✅ **Automatic outline generation** - Creates logical section structure from research
- ✅ **JSON structure** - Outline stored as array of section titles
- ✅ **Keyword-aware** - Sections informed by research keywords and sources
- ✅ **Customizable** - Can be reviewed before section writing

### Output Format:
```json
[
  "Introduction to Neck Pain",
  "Common Causes of Neck Pain",
  "Treatment Options",
  "Exercises and Recovery",
  "When to Seek Medical Help"
]
```

---

## 3. Section-by-Section Writing

**Objective:** Generate content sections with research context

### Features:
- ✅ **GPT-4 powered writing** - Uses OpenAI API with research context
- ✅ **Individual section generation** - Write one section at a time
- ✅ **Progress tracking** - UI shows which sections are completed
- ✅ **Word count per section** - Tracks length of each section
- ✅ **Research-informed** - Each section can reference available sources

### API Endpoint:
```
POST /api/blog/write-section
- Input: draftId, sectionIndex, outline
- Output: sections[] with title, content, wordCount
```

---

## 4. Assemble Phase

**Objective:** Combine sections into publish-ready structured object with automatic metadata

### Generated Fields:

#### **Core Content**
- ✅ `title` - Keyword-optimized title (editable)
- ✅ `slug` - URL-safe, normalized slug (auto-generated, editable)
  - Lowercase conversion
  - Special character removal
  - Hyphenation
  - Trailing/leading hyphen removal
- ✅ `content` - Full Markdown body from combined sections
- ✅ `sections` - Array of section objects with title, content, wordCount

#### **SEO & Metadata**
- ✅ `excerpt` - Summary paragraph for preview (auto-generated, editable)
- ✅ `seoTitle` - Meta title optimized for search engines (auto-generated, editable)
- ✅ `seoDescription` - Meta description for search engine results (auto-generated, editable)
- ✅ `seoKeywords` - Array of SEO keywords (auto-generated, editable)
- ✅ `featuredImageUrl` - Optional cover image URL (editable)

#### **Enriched Content**
- ✅ `faqs` - Auto-generated Q&A pairs from topic and sections
  - Questions derived from common queries about topic
  - Answers synthesized from section content
- ✅ `checklist` - Recovery/action item checklist
  - Common steps for the condition
  - Treatment milestones
  - Self-care activities
- ✅ `outboundLinks` - Tracked citations from selected sources
  - Title, URL, source domain
  - Used for attribution and SEO
  - Filters by selected sources only

#### **Metadata**
- ✅ `author` - "JT Physiotherapy" by default
- ✅ `publishDate` - ISO format date
- ✅ `readTime` - Calculated word count ÷ 200 (industry standard)
- ✅ `category` - "Health & Wellness" by default
- ✅ `featured` - Boolean flag for homepage featuring

### Assembly Process:
```typescript
assembleBlogPost(
  topic: string,
  sections: BlogSection[],
  metadata: BlogMetadata,
  researchData: ResearchData,
  selectedSourceIds?: string[]  // Filter sources
): BlogPost
```

---

## 5. Admin UI Editing

**Objective:** Manual control over all generated fields before publishing

### Features:
- ✅ **Draft list** - View all in-progress and published blogs
- ✅ **Editable metadata** - Modify any field with real-time updates:
  - Title, slug, excerpt
  - SEO title, description, keywords
  - Featured image URL
- ✅ **Markdown editor** - Full content editing with:
  - Live HTML preview (side-by-side)
  - Toggle to show/hide editor
  - Syntax highlighting
- ✅ **Generated extras display** - View (non-editable):
  - FAQs with questions and answers
  - Recovery checklist
  - Outbound links with sources
- ✅ **Source selection** - Checkbox UI to select/deselect sources
- ✅ **Custom search** - Input field to find more specific sources
- ✅ **Progress indicators** - Shows which sections are written
- ✅ **Status badges** - draft | writing | assembled | published

---

## 6. Publishing Flow

**Objective:** Convert to Wix format and publish to blog platform

### Features:
- ✅ **Markdown to Wix Ricos conversion** - Transforms Markdown to Wix rich content
  - **Headings**: `# H1`, `## H2`, `### H3` → Wix heading nodes
  - **Paragraphs**: Text blocks → Wix text nodes
  - **Lists**: `- item` → Wix list nodes
  - **Bold/Italic**: `**bold**`, `*italic*` → text decorations
  - **Links**: `[text](url)` → Wix link nodes
  - **Code blocks**: `` `code` `` → code formatting
- ✅ **Cover image handling** - Optional featured image upload to Wix
- ✅ **Slug normalization** - Ensures valid URL formatting before publishing
- ✅ **Post creation** - Creates new post on Wix Blog
- ✅ **Post updating** - Updates existing post if already published
- ✅ **Wix metadata** - Tags, featured status, publish date all included
- ✅ **Error handling** - Graceful fallback and user feedback
- ✅ **URL generation** - Returns Wix blog URL after successful publish

### API Endpoint:
```
POST /api/blog/publish
- Input: draftId, metadata, content, selectedSourceIds
- Output: success, postId, url
```

---

## 7. Public Blog Rendering

**Objective:** Display published posts with proper formatting and styling

### Pages:
- ✅ `/blogs` - Blog listing page
  - Fetches posts from Wix API
  - Shows title, excerpt, featured image, publish date
  - Sorting by publish date
- ✅ `/blogs/[slug]` - Individual blog post page
  - Renders Wix rich content (Ricos)
  - Converts Ricos to HTML with proper styling
  - Displays cover image, title, metadata, content

### Rendering Features:
- ✅ **Wix Ricos parsing** - Interprets Wix rich content structure
- ✅ **HTML conversion** - Transforms Ricos nodes to semantic HTML
- ✅ **Scoped styling** - CSS applied only to blog content area:
  - Headings (h1, h2, h3) with proper hierarchy
  - Lists (ul, ol) with indentation
  - Text decorations (bold, italic, underline, strikethrough)
  - Links with hover effects
  - Code blocks with monospace font
- ✅ **Media resolution** - Converts Wix image URIs to CDN URLs
- ✅ **Layout components** - Integrated with Header, Footer, FadeIn animations
- ✅ **Responsive design** - Mobile-friendly rendering

---

## 8. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Start New Blog (Seed Keyword)                           │
│     └─→ Research API (sources, keywords)                    │
│     └─→ Generate Outline                                   │
│                                                             │
│  2. Write Sections                                          │
│     └─→ Write Section API (iterative)                       │
│     └─→ GPT-4 generates content                             │
│                                                             │
│  3. Review & Search Sources                                 │
│     └─→ Source checkboxes (select/deselect)                │
│     └─→ Custom search input (find more)                    │
│     └─→ Research More API (combine sources)                │
│                                                             │
│  4. Edit Everything                                         │
│     └─→ Title, slug, excerpt                               │
│     └─→ SEO fields (title, description, keywords)           │
│     └─→ Markdown content with live preview                 │
│     └─→ Featured image URL                                 │
│                                                             │
│  5. Assemble Post                                           │
│     └─→ Combine sections → Markdown body                   │
│     └─→ Auto-generate FAQs, checklist, links               │
│     └─→ Calculate read time                                │
│     └─→ Create BlogPost object                             │
│                                                             │
│  6. Publish to Wix                                          │
│     └─→ Convert Markdown to Ricos                          │
│     └─→ Upload cover image (optional)                      │
│     └─→ Create/update Wix blog post                        │
│     └─→ Return Wix blog URL                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Public Website                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /blogs          → Blog list (fetched from Wix)            │
│  /blogs/[slug]   → Individual post                         │
│                   ├─ Parse Wix Ricos                       │
│                   ├─ Convert to HTML                       │
│                   └─ Apply scoped styling                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Differentiators

### ✅ Fully Automated Metadata Generation
- Title, slug, excerpt, SEO fields all auto-generated from research and content
- User never needs to manually create a URL slug or write SEO descriptions
- All fields remain editable before publishing

### ✅ Research-Driven Content
- Every blog starts with authoritative sources
- Sources are selectable and trackable
- FAQs and checklists generated from research context

### ✅ Structured Output
- Outline → Sections → Assembled Post with JSON structure
- No free-form writing; content follows logical flow

### ✅ Multi-stage Editing
- Draft/Research stage
- Writing stage (section by section)
- Assembly stage (view auto-generated extras)
- Final editing stage (modify any field)

### ✅ Platform Integration
- Wix Blog API for publishing
- Vertex AI Search for research
- OpenAI GPT-4 for content generation
- Markdown-to-Ricos conversion for rich formatting

---

## Environment Variables Required

```
# Wix Integration
WIX_API_KEY=...
WIX_SITE_ID=...
WIX_AUTHOR_MEMBER_ID=...

# Google Cloud (Vertex Search)
GCP_PROJECT_ID=jt-football-physiotherapy
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=blog-research-index_1771434940842
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json

# Google Search Fallback
GOOGLE_CSE_API_KEY=...
GOOGLE_CSE_CX=...

# Google Places (Location Info)
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...

# OpenAI (Content Generation)
OPENAI_API_KEY=...

# Admin Auth
ADMIN_PASSWORD=...
```

---

## Testing Checklist

- [ ] Research returns 5+ sources from Vertex
- [ ] Can search for custom sources (e.g., "knee pain exercises")
- [ ] Can select/deselect sources with checkboxes
- [ ] Outline generates automatically
- [ ] Can write sections one at a time
- [ ] FAQs auto-generate from topic and content
- [ ] Checklist includes relevant items
- [ ] Outbound links show only selected sources
- [ ] Slug properly normalized (lowercase, hyphens, no special chars)
- [ ] Can edit title, excerpt, SEO fields in admin UI
- [ ] Markdown editor shows live HTML preview
- [ ] Can publish to Wix Blog
- [ ] Published post appears at `/blogs/[slug]`
- [ ] Blog post renders correctly with proper formatting
- [ ] Read time calculates correctly
- [ ] Cover image displays if provided
