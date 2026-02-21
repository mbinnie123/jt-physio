# Blog Automation System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                                │
│                   /admin (Password Protected)                       │
│                     Built with React & Tailwind                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
          ┌─────────▼────────┐   ┌──────▼──────────┐
          │  Create New Blog │   │ View Existing   │
          │       Post       │   │     Drafts      │
          └────────┬─────────┘   └─────────────────┘
                   │
                   │ POST /api/blog/research
                   │
      ┌────────────▼────────────┐
      │   RESEARCH PHASE        │
      │  (2-3 seconds)          │
      ├─────────────────────────┤
      │ Google Custom Search    │
      │ Keyword Extraction      │
      │ Google Places API       │
      │ Vertex AI Integration   │
      └────────────┬────────────┘
                   │
            ┌──────▼────────┐
            │  Research     │
            │  Data Ready   │
            │  + Outline    │
            └──────┬────────┘
                   │
      ┌────────────▼────────────┐
      │  WRITING PHASE          │
      │  (10-15 min total)      │
      ├─────────────────────────┤
      │ POST /api/blog/         │
      │       write-section     │
      │                         │
      │ For each section:       │
      │ • OpenAI GPT-4          │
      │ • Research-based        │
      │ • Professional tone     │
      │ • 300+ word sections    │
      └────────────┬────────────┘
                   │
            ┌──────▼────────┐
            │  All Sections │
            │    Written    │
            └──────┬────────┘
                   │
      ┌────────────▼────────────┐
      │  ASSEMBLY PHASE         │
      │  (<1 second)            │
      ├─────────────────────────┤
      │ POST /api/blog/publish  │
      │                         │
      │ • Combine sections      │
      │ • Generate metadata     │
      │ • Create SEO title      │
      │ • Calculate read time   │
      │ • Validate content      │
      └────────────┬────────────┘
                   │
            ┌──────▼────────┐
            │  Blog Post    │
            │   Assembled   │
            │    & Ready    │
            └──────┬────────┘
                   │
      ┌────────────▼────────────┐
      │  PUBLISHING PHASE       │
      │  (2-3 seconds)          │
      ├─────────────────────────┤
      │ POST /api/blog/publish  │
      │                         │
      │ • Convert to Wix format │
      │ • Call Wix API          │
      │ • Get post URL          │
      │ • Store post ID         │
      └────────────┬────────────┘
                   │
      ┌────────────▼────────────┐
      │  SYNC PHASE             │
      │  (Optional)             │
      ├─────────────────────────┤
      │ POST /api/wix/blog/sync │
      │                         │
      │ • Fetch posts from Wix  │
      │ • Update local DB       │
      │ • Verify publication    │
      └────────────┬────────────┘
                   │
            ┌──────▼────────┐
            │   Published   │
            │   on Wix!     │
            │  Public URL   │
            │   Ready       │
            └───────────────┘
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Next.js Application                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Admin Dashboard                           │   │
│  │                    app/admin/page.tsx                        │   │
│  │                                                              │   │
│  │  • Draft Management                                         │   │
│  │  • Real-time Progress                                       │   │
│  │  • Section Editing                                          │   │
│  │  • One-click Publishing                                     │   │
│  └───────────────┬────────────────────────────────────────────┘   │
│                  │                                                   │
│  ┌───────────────▼────────────────────────────────────────────┐   │
│  │                    API Routes                               │   │
│  │         Next.js API Route Handlers                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • POST /api/blog/research        (Research)              │   │
│  │ • POST /api/blog/write-section   (Writing)               │   │
│  │ • POST /api/blog/publish         (Assembly & Publish)    │   │
│  │ • GET  /api/wix/blog/sync        (Sync)                  │   │
│  └───────────────┬────────────────────────────────────────────┘   │
│                  │                                                   │
│  ┌───────────────▼────────────────────────────────────────────┐   │
│  │              Blog Automation Library                        │   │
│  │             lib/blog-automation/                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • research.ts        - Google CSE, Vertex AI             │   │
│  │ • writer.ts          - OpenAI GPT-4                      │   │
│  │ • assembler.ts       - HTML/Markdown formatting          │   │
│  │ • wix-publisher.ts   - Wix API integration               │   │
│  │ • db.ts              - Draft storage                      │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                    │
└───────────────┼────────────────────────────────────────────────────┘
                │
    ┌───────────┴─────────────────────┬───────────┬──────────────┐
    │                                 │           │              │
┌───▼─────────┐  ┌─────────────────┐ │  ┌──────▼──────┐  ┌─────▼────┐
│   OpenAI    │  │  Google APIs    │ │  │  Wix Blog   │  │ Google   │
│   GPT-4     │  │                 │ │  │    API      │  │ Places   │
│             │  │ • CSE Search    │ │  │             │  │ API      │
│ Content     │  │ • Vertex AI     │ │  │ Publishing  │  │          │
│ Generation  │  │ • NLP           │ │  │ Integration │  │ Location │
└─────────────┘  └─────────────────┘ │  └─────────────┘  │ Data     │
                                      │                   └──────────┘
                                      │
                                      │  ┌─────────────────────┐
                                      └─▶│   External APIs     │
                                         │                     │
                                         │ • OpenAI            │
                                         │ • Google Cloud      │
                                         │ • Wix               │
                                         └─────────────────────┘
```

## Data Flow Diagram

```
Research Phase
──────────────
Topic Input
    │
    ├─→ Extract Keywords
    │
    ├─→ Google CSE Search (8 results)
    │
    ├─→ Google Places API (Business info)
    │
    ├─→ Vertex AI Search (Optional)
    │
    └─→ ResearchData Object
        {
          topic: string
          keywords: string[]
          sources: ResearchResult[]
          locationInfo: any
          timestamp: string
        }


Writing Phase
─────────────
For Each Section:
    │
    ├─→ Build Prompt
    │   • Topic
    │   • Section Title
    │   • Research Data
    │   • Keywords
    │   • Target Audience
    │   • Tone
    │
    ├─→ Call OpenAI GPT-4
    │
    ├─→ Generate Content
    │
    └─→ BlogSection Object
        {
          title: string
          content: string
          sectionNumber: number
          wordCount: number
        }


Assembly Phase
──────────────
BlogSection[] Input
    │
    ├─→ Combine Content
    │
    ├─→ Generate Metadata
    │   • SEO Title
    │   • Meta Description
    │   • Keywords
    │   • URL Slug
    │
    ├─→ Calculate Metrics
    │   • Total word count
    │   • Reading time
    │
    └─→ BlogPost Object
        {
          title: string
          slug: string
          description: string
          keywords: string[]
          content: string
          sections: BlogSection[]
          metadata: {}
        }


Publishing Phase
────────────────
BlogPost Input
    │
    ├─→ Convert to Wix Format
    │
    ├─→ Call Wix Blog API
    │
    ├─→ Get Post ID & URL
    │
    └─→ Update Draft Status
        to "published"
```

## File Structure

```
jt-physio/
├── app/
│   ├── admin/
│   │   └── page.tsx                    (Admin Dashboard)
│   └── api/
│       ├── blog/
│       │   ├── research/
│       │   │   └── route.ts            (Research Endpoint)
│       │   └── write-section/
│       │       └── route.ts            (Writing Endpoint)
│       │   └── publish/
│       │       └── route.ts            (Assembly & Publishing)
│       └── wix/
│           └── blog/
│               └── sync/
│                   └── route.ts        (Wix Sync Endpoint)
│
├── lib/
│   └── blog-automation/
│       ├── index.ts                    (Main Exports)
│       ├── research.ts                 (Research Logic)
│       ├── writer.ts                   (Content Writing)
│       ├── assembler.ts                (Blog Assembly)
│       ├── wix-publisher.ts            (Wix Integration)
│       └── db.ts                       (Draft Storage)
│
├── scripts/
│   └── test-blog-api.sh               (Testing Script)
│
├── BLOG_AUTOMATION_README.md           (Full Documentation)
├── SETUP_GUIDE.md                      (API Configuration)
├── BLOG_QUICK_REFERENCE.md            (Quick Guide)
├── IMPLEMENTATION_SUMMARY.md           (Project Overview)
├── ARCHITECTURE.md                     (This File)
│
├── package.json                        (Dependencies Updated)
├── .env.local                          (Environment Variables)
└── ...other files...
```

## Component Dependencies

```
Admin Dashboard
    ↓
    └─→ API Routes
        ├─→ Research Service
        │   ├─→ Google Custom Search
        │   ├─→ Google Places API
        │   └─→ Vertex AI (Optional)
        │
        ├─→ Writer Service
        │   └─→ OpenAI GPT-4
        │
        ├─→ Assembler Service
        │   └─→ Local Processing
        │
        └─→ Publisher Service
            ├─→ Assembler Service
            ├─→ Wix API
            └─→ Database
```

## State Management

```
Blog Draft States
─────────────────

┌─────────┐
│ Draft   │  Initial state - form filled
└────┬────┘
     │
     │ POST /api/blog/research
     ▼
┌─────────┐
│Writing  │  Research complete, sections being written
└────┬────┘
     │
     │ All sections written
     ▼
┌──────────┐
│Assembled │  All sections combined, ready to publish
└────┬─────┘
     │
     │ POST /api/blog/publish
     ▼
┌──────────┐
│Published │  Successfully published to Wix
└──────────┘
```

## Security Architecture

```
┌─────────────────────────────────────┐
│      Admin Dashboard                │
│   (Password Protected - Login)      │
└──────────────┬──────────────────────┘
               │
         Bearer Token
         (Password Hash)
               │
┌──────────────▼──────────────────────┐
│      API Route Handlers             │
│   (Auth Header Verification)        │
├─────────────────────────────────────┤
│ 1. Extract auth header              │
│ 2. Compare with ADMIN_PASSWORD      │
│ 3. Proceed if valid                 │
│ 4. Reject with 401 if invalid       │
└──────────────┬──────────────────────┘
               │
        ✅ Access Granted
               │
┌──────────────▼──────────────────────┐
│    Authenticated Services           │
│   (Research, Write, Publish)        │
└─────────────────────────────────────┘

Wix Sync Security
─────────────────
      Sync Request
           │
      Sync Secret Header
           │
┌──────────▼──────────┐
│ Verify Secret       │
│ Compare with        │
│ BLOG_SYNC_SECRET    │
└──────────┬──────────┘
      ✅ Valid
           │
    Proceed with Sync
```

---

This architecture provides:
- ✅ Modular, maintainable code
- ✅ Clear separation of concerns
- ✅ Easy to extend with new features
- ✅ Scalable design
- ✅ Secure authentication
- ✅ Type-safe with TypeScript

