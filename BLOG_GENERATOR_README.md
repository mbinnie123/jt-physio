# JT Physiotherapy Blog Generator System

## Overview

This is a **production-grade, research-driven blog content automation system** that transforms a seed keyword into a fully assembled, SEO-optimized, publish-ready blog post in minutes.

Unlike traditional content generators that produce free-form text, this system follows a structured pipeline: Research → Outline → Write Sections → Assemble with Metadata → Publish.

---

## Key Features

### 🔍 Research-Driven Foundation
- **Vertex AI Search** integration with 22+ indexed medical sources
- **Source accumulation** - Add more sources through custom searches
- **Source selection** - Choose which sources to cite in your blog
- **Fallback chain** - Vertex → Google Custom Search → Mock medical sources

### 📋 Structured Outline Generation
- Automatic outline created from research context
- Section-by-section writing with progress tracking
- JSON structure keeps content organized

### ✍️ Content Generation
- **GPT-4 powered** section writing
- **Research-informed** - Each section can reference sources
- **Iterative writing** - Write one section at a time
- **Word count tracking** - Monitor content length

### 🤖 Intelligent Assembly
The assemble phase automatically generates:

| Field | Generated | Editable |
|-------|-----------|----------|
| **title** | Keyword-optimized | ✅ Yes |
| **slug** | URL-safe, normalized | ✅ Yes |
| **excerpt** | Summary from content | ✅ Yes |
| **seoTitle** | Meta title for search | ✅ Yes |
| **seoDescription** | Meta description | ✅ Yes |
| **seoKeywords** | Extracted from topic | ✅ Yes |
| **content** | Markdown from sections | ✅ Yes |
| **faqs** | Q&A from topic/content | View only |
| **checklist** | Recovery/action items | View only |
| **outboundLinks** | Citations from sources | Auto (from selected sources) |
| **readTime** | Calculated (words ÷ 200) | Auto |
| **wordCount** | Total words | Auto |

### 📝 Admin Dashboard
- **Draft management** - Create, edit, review, publish
- **Metadata editing** - Modify title, slug, excerpt, SEO fields
- **Markdown editor** - Full content editing with live HTML preview
- **Source selection** - Checkboxes to include/exclude sources
- **Custom search** - Find additional sources on the fly
- **Status tracking** - draft | writing | assembled | published

### 🚀 Wix Blog Publishing
- **Markdown to Ricos conversion** - Transforms markdown to Wix rich content
  - Headings (h1, h2, h3)
  - Paragraphs
  - Bold, italic, code formatting
  - Unordered and ordered lists
  - Links with proper attributes
- **Cover image support** - Optional featured image
- **Slug normalization** - Ensures valid URLs
- **Automatic publishing** - Creates post on Wix Blog
- **Update support** - Edit existing posts

### 🌐 Public Blog Rendering
- **List page** (`/blogs`) - All published posts with metadata
- **Detail page** (`/blogs/[slug]`) - Full post with formatted content
- **Wix Ricos parsing** - Converts rich content to HTML
- **Scoped styling** - Proper formatting without affecting site
- **Responsive design** - Mobile-friendly layouts

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD (/admin)                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Research Phase                                                │
│    • Input: Seed keyword                                         │
│    • Calls: /api/blog/research                                   │
│    • Gets: 5-8 sources, keywords, outline                        │
│    • Can: Search custom topics, add more sources                 │
│                                                                  │
│ 2. Writing Phase                                                 │
│    • Calls: /api/blog/write-section (iterative)                  │
│    • Generates: One section at a time                            │
│    • Can: Review, skip, regenerate sections                      │
│                                                                  │
│ 3. Assembly Phase                                                │
│    • Combines: All sections → Markdown body                      │
│    • Generates: Title, slug, excerpt, SEO, FAQs, checklist      │
│    • Creates: BlogPost object with all metadata                 │
│                                                                  │
│ 4. Editing Phase                                                 │
│    • Edit: Any field (title, excerpt, content, etc.)            │
│    • View: Auto-generated FAQs, checklist, links                │
│    • Select: Which sources to cite                              │
│    • Preview: Live Markdown to HTML conversion                  │
│                                                                  │
│ 5. Publishing Phase                                              │
│    • Convert: Markdown → Wix Ricos (rich content)              │
│    • Upload: Featured image (optional)                          │
│    • Publish: To Wix Blog                                       │
│    • Get: Public URL                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ PUBLIC WEBSITE                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ /blogs              → Blog listing (from Wix)                   │
│ /blogs/[slug]       → Individual post                           │
│                      • Fetch from Wix Blog API                   │
│                      • Parse Wix Ricos format                    │
│                      • Convert to HTML                          │
│                      • Apply styled rendering                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### POST `/api/blog/research`
**Research and gather sources**

```typescript
Request:
{
  topic: string              // "Neck Pain", "Knee Injuries", etc.
  draftId?: string          // Existing draft ID
  researchMore?: boolean    // Append to existing sources
}

Response:
{
  success: boolean
  draft: BlogDraft
  research: {
    sources: [
      {
        title: string       // Source title
        content: string     // Snippet/excerpt
        source: string      // Domain name
        url: string        // Full URL
        relevanceScore: number
      }
    ]
    keywords: string[]     // Extracted keywords
  }
  outline: string[]        // Section titles
}
```

### POST `/api/blog/write-section`
**Write individual sections**

```typescript
Request:
{
  draftId: string         // Which draft
  sectionIndex: number    // Which section (0-based)
}

Response:
{
  success: boolean
  section: {
    title: string
    content: string       // Markdown
    wordCount: number
  }
  sections: BlogSection[] // All sections so far
}
```

### POST `/api/blog/publish`
**Assemble and publish to Wix**

```typescript
Request:
{
  draftId: string              // Which draft to publish
  metadata: {
    title?: string
    slug?: string
    excerpt?: string
    seoTitle?: string
    seoDescription?: string
    featuredImageUrl?: string
  }
  content?: string             // Optional markdown override
  selectedSourceIds?: string[] // Which sources to cite
}

Response:
{
  success: boolean
  postId: string             // Wix post ID
  url: string               // Public URL
  error?: string
}
```

### GET `/api/blog/research`
**Retrieve draft research**

```typescript
Query:
{
  draftId?: string  // Specific draft or all in-progress
}

Response:
{
  drafts: BlogDraft[]
}
```

### GET `/api/blog/write-section`
**Get draft outline**

```typescript
Query:
{
  draftId: string
}

Response:
{
  draft: BlogDraft
}
```

---

## Data Models

### BlogDraft
```typescript
{
  id: string                    // Unique draft ID
  topic: string                 // Seed keyword
  status: "draft" | "writing" | "assembled" | "published"
  sections: BlogSection[]       // Written sections
  metadata: BlogMetadata        // Editable metadata
  researchData: ResearchData    // Sources & keywords
  selectedSourceIds: string[]   // Which sources are selected
  createdAt: string            // ISO timestamp
  updatedAt: string
  publishedAt?: string
  wixPostId?: string
}
```

### BlogMetadata
```typescript
{
  // Core
  title: string
  slug: string
  excerpt: string
  
  // SEO
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  
  // Media
  featuredImageUrl?: string
  
  // Publishing
  author: string              // "JT Physiotherapy"
  publishDate: string        // ISO date
  readTime: number           // Calculated
  category: string           // "Health & Wellness"
  featured: boolean
  
  // Enriched content
  faqs: Array<{question, answer}>
  checklist: string[]
  outboundLinks: Array<{title, url, source}>
}
```

### BlogPost
```typescript
{
  title: string
  slug: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  featuredImageUrl?: string
  content: string             // Markdown
  sections: BlogSection[]
  faqs: Array<{question, answer}>
  checklist: string[]
  outboundLinks: Array<{title, url, source}>
  metadata: {
    author: string
    publishDate: string
    readTime: number
    category: string
    featured: boolean
  }
  researchData?: ResearchData
}
```

---

## Slug Generation

Slugs are automatically normalized to be URL-safe:

```
Input: "Neck Pain: Causes & Treatment"
Process:
  1. Lowercase: "neck pain: causes & treatment"
  2. Remove special chars: "neck pain causes  treatment"
  3. Replace spaces with hyphens: "neck-pain-causes--treatment"
  4. Remove duplicate hyphens: "neck-pain-causes-treatment"
Result: "neck-pain-causes-treatment"
```

Slugs remain fully editable in the admin UI before publishing.

---

## Markdown to Wix Ricos Conversion

The system converts Markdown to Wix rich content format:

### Supported Elements

| Markdown | Wix Ricos | Result |
|----------|-----------|--------|
| `# Heading` | heading (level 1) | H1 heading |
| `## Heading` | heading (level 2) | H2 heading |
| `### Heading` | heading (level 3) | H3 heading |
| `Normal text` | paragraph | Body text |
| `**bold**` | text with BOLD decoration | **Bold text** |
| `*italic*` | text with ITALIC decoration | *Italic text* |
| `` `code` `` | text with CODE decoration | `code` |
| `- item` | unordered-list → list-item | • Bullet list |
| `1. item` | ordered-list → list-item | 1. Numbered list |
| `[text](url)` | text with link | Hyperlink |

### Example Conversion

**Input Markdown:**
```markdown
# Neck Pain Treatment

Neck pain affects many people. Treatment includes:

- Physical therapy
- Exercises
- Rest and recovery

**Professional help** may be needed.
```

**Output Wix Ricos:**
```json
{
  "version": 1,
  "nodes": [
    {
      "type": "heading",
      "headingLevel": 1,
      "nodes": [{ "type": "text", "textData": { "text": "Neck Pain Treatment" } }]
    },
    {
      "type": "paragraph",
      "nodes": [{ "type": "text", "textData": { "text": "Neck pain affects many people. Treatment includes:" } }]
    },
    {
      "type": "unordered-list",
      "nodes": [
        { "type": "list-item", "nodes": [{ "type": "text", "textData": { "text": "Physical therapy" } }] },
        { "type": "list-item", "nodes": [{ "type": "text", "textData": { "text": "Exercises" } }] },
        { "type": "list-item", "nodes": [{ "type": "text", "textData": { "text": "Rest and recovery" } }] }
      ]
    },
    {
      "type": "paragraph",
      "nodes": [{
        "type": "text",
        "textData": {
          "text": "Professional help",
          "decorations": [{ "type": "BOLD" }]
        }
      }, { "type": "text", "textData": { "text": " may be needed." } }]
    }
  ]
}
```

---

## Environment Variables

```env
# Wix Blog Integration
WIX_API_KEY=IST.eyJ...              # Bearer token
WIX_SITE_ID=a0398594-eaee-40bf-...  # Site ID
WIX_AUTHOR_MEMBER_ID=ba6adc02-...  # Author ID

# Google Cloud / Vertex Search
GCP_PROJECT_ID=jt-football-physiotherapy
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=blog-research-index_1771434940842
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json

# Google Custom Search (fallback)
GOOGLE_CSE_API_KEY=AIzaSy...
GOOGLE_CSE_CX=21d30ac1...

# Google Places (location context)
GOOGLE_PLACES_API_KEY=AIzaSy...
GOOGLE_PLACE_ID=ChIJ0do...

# OpenAI (content generation)
OPENAI_API_KEY=sk-proj-...

# Admin Authentication
ADMIN_PASSWORD=JtPhysio_Admin_2026!9kP
```

---

## Usage Example

### 1. Create a New Blog
```
POST /api/blog/research
{
  "topic": "ACL Injury Recovery"
}
```

**Gets:** 5-8 sources about ACL injuries, outline of sections

### 2. Review Sources & Search More
```
- See 5 sources in admin UI
- Click "Select Sources" for sources you want to cite
- Type "ACL physiotherapy exercises" in search box
- Click "Search Sources"
- Now have 10+ sources, select favorites
```

### 3. Write Sections
```
POST /api/blog/write-section
{
  "draftId": "blog_1708XXX_1",
  "sectionIndex": 0
}
```

**Gets:** First section written with GPT-4, repeat for each section

### 4. Review & Edit
```
- Admin UI shows all generated metadata
- Edit title: "ACL Injury Recovery Guide"
- Edit slug: "acl-recovery-guide"
- Edit excerpt: "Complete guide to ACL injury..."
- Edit SEO title/description
- View FAQs, checklist, links auto-generated
- Edit markdown content with live preview
```

### 5. Publish
```
POST /api/blog/publish
{
  "draftId": "blog_1708XXX_1",
  "selectedSourceIds": ["source_1", "source_3", ...],
  "metadata": { /* edited fields */ }
}
```

**Gets:** Published URL: `https://jt-physio.wixsite.com/blog/acl-recovery-guide`

### 6. View on Public Site
```
https://jt-physio.com/blogs/acl-recovery-guide
```

Post displays with proper formatting, cover image, and styling.

---

## Testing Checklist

### Research Phase
- [ ] Research returns 5+ sources from Vertex
- [ ] Can search custom queries (e.g., "ACL exercises")
- [ ] Sources show title, URL, snippet, source domain
- [ ] "Search Sources" button merges results without duplicates
- [ ] Can select/deselect individual sources
- [ ] Selected sources count displayed

### Writing Phase
- [ ] Outline auto-generates
- [ ] Can write sections one at a time
- [ ] Each section shows word count
- [ ] Progress bar shows completed sections
- [ ] Outline visible while writing

### Assembly Phase
- [ ] FAQs auto-generate from topic + content
- [ ] Checklist items appear (condition-specific)
- [ ] Outbound links generated from selected sources
- [ ] Read time calculated correctly
- [ ] Slug normalized properly (lowercase, hyphens, no special chars)

### Editing Phase
- [ ] Can edit title, slug, excerpt
- [ ] Can edit SEO fields
- [ ] Markdown editor toggles on/off
- [ ] Live preview shows HTML rendering
- [ ] Featured image URL field works

### Publishing Phase
- [ ] Markdown converts to Wix Ricos correctly
- [ ] Post publishes to Wix Blog
- [ ] Returns Wix blog URL
- [ ] Cover image uploads if provided
- [ ] Tags added to post

### Public Rendering
- [ ] Blog list shows all posts (`/blogs`)
- [ ] Individual post accessible (`/blogs/[slug]`)
- [ ] Content renders with proper formatting
- [ ] Headings properly sized (h1, h2, h3)
- [ ] Bold, italic, lists display correctly
- [ ] Links clickable and open in new tab
- [ ] Cover image displays
- [ ] Read time shows
- [ ] Metadata (title, excerpt) visible
- [ ] Responsive on mobile

---

## Troubleshooting

### Sources showing mock/fallback sources instead of Vertex
- Check: `VERTEX_DATA_STORE_ID` and `GCP_LOCATION` in `.env.local`
- Check: `GOOGLE_APPLICATION_CREDENTIALS` file exists and is valid
- Check: Browser console for `[Vertex]` logs
- Check: Vertex data store has documents indexed (22+ items)

### Slug not normalizing correctly
- Check: `generateSlug()` function in `lib/blog-automation/assembler.ts`
- Slug should be: lowercase, hyphenated, no special characters

### Wix publishing fails
- Check: `WIX_API_KEY`, `WIX_SITE_ID`, `WIX_AUTHOR_MEMBER_ID` set
- Check: Wix blog exists on site
- Check: API key has correct permissions

### Markdown preview not showing
- Check: Browser DevTools for errors
- Check: Markdown is valid syntax
- Try: Toggle "Show Markdown Editor" off/on

---

## Architecture Decisions

### Why Markdown internally?
- **Simple storage** - Easy to edit, version, store
- **Universal format** - Can convert to any platform (Wix, Medium, etc.)
- **Human readable** - Admin can edit directly

### Why Wix Ricos conversion?
- **Rich formatting** - Wix expects proprietary format
- **Proper styling** - Ricos preserves headings, lists, decorations
- **Platform compatibility** - Works with Wix Blog API

### Why separate source selection?
- **Quality control** - Not all found sources are authoritative
- **Citation control** - Avoid citing unvetted sources
- **SEO optimization** - Only cite high-authority domains

### Why slug as a field?
- **Control** - Auto-generated but fully customizable
- **SEO** - Can optimize for keywords
- **Brand** - Custom URLs (e.g., "acl-recovery" vs "acl-injury-recovery")

---

## Future Enhancements

- [ ] Image upload/picker for featured image
- [ ] Draft auto-save every 30 seconds
- [ ] Version history/revision tracking
- [ ] Blog post templates
- [ ] Scheduling (publish at specific date/time)
- [ ] Analytics tracking (views, engagement)
- [ ] Internal linking suggestions
- [ ] Reading level analysis
- [ ] Keyword density analysis
- [ ] Export to PDF/Word
- [ ] Bulk operations (publish multiple drafts)
- [ ] AI-powered title suggestions
- [ ] SEO score calculation

---

## Support

For issues, check:
1. Terminal logs in dev server for `[Research]`, `[Vertex]`, `[Wix]` prefixed messages
2. Browser console for client-side errors
3. Admin dashboard status badges (draft/writing/assembled/published)
4. API response details in network tab

---

**Version:** 1.0.0  
**Last Updated:** February 20, 2026  
**Status:** Production Ready
