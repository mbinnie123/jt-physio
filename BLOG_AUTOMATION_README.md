# Blog Automation Generator

A complete blog automation system that uses AI to research, write, assemble, and publish blog posts directly to your Wix website.

## System Architecture

```
Admin Dashboard (http://yoursite.com/admin)
    ↓
Research API (/api/blog/research)
    → Conducts research using Google Custom Search & Vertex AI
    ↓
Write Section API (/api/blog/write-section)
    → Generates blog sections using OpenAI GPT-4
    ↓
Assemble API (/api/blog/publish)
    → Assembles sections into complete blog post
    ↓
Publish API (/api/blog/publish)
    → Publishes to Wix Blog
    ↓
Wix Sync API (/api/wix/blog/sync)
    → Syncs blog metadata back to system
    ↓
Public Wix Blog
```

## Features

### 🔍 Research Phase
- Uses Google Custom Search Engine (CSE) for research
- Integrates with Vertex AI Generative Search
- Uses Google Places API for location-specific information
- Automatically extracts relevant keywords

### ✍️ Writing Phase
- OpenAI GPT-4 integration for content generation
- Customizable tone (professional, friendly, expert, clinical)
- Automatic outline generation
- Section-by-section writing with word count targets
- Generates SEO metadata and blog titles

### 🧩 Assembly Phase
- Combines sections into complete blog posts
- Generates HTML and Markdown formats
- Calculates reading time estimates
- Validates content quality

### 📤 Publishing Phase
- Direct integration with Wix Blog API
- Auto-publishes to your Wix site
- Syncs metadata back to system
- Supports updating existing posts

### 🔐 Admin Dashboard
- Beautiful, intuitive UI for managing the workflow
- Real-time progress tracking
- Draft management and editing
- One-click publishing

## Setup

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `axios` - HTTP client
- `openai` - OpenAI API integration
- `@google-cloud/discoveryengine` - Vertex AI integration

### 2. Environment Variables

Add these to your `.env.local`:

```env
# Google APIs
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_PLACE_ID=your_google_place_id
GOOGLE_CSE_API_KEY=your_google_cse_api_key
GOOGLE_CSE_CX=your_google_cse_id

# Google Cloud / Vertex AI
GCP_PROJECT_ID=your_gcp_project_id
GCP_LOCATION=global
VERTEX_DATA_STORE_ID=your_vertex_data_store_id
VERTEX_ENGINE_ID=your_vertex_engine_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Wix Integration
WIX_API_KEY=your_wix_api_key
WIX_SITE_ID=your_wix_site_id
WIX_ACCOUNT_ID=your_wix_account_id
WIX_AUTHOR_MEMBER_ID=your_wix_author_id

# Admin Authentication
ADMIN_PASSWORD=your_secure_admin_password

# Blog Sync Secret
BLOG_SYNC_SECRET=your_sync_secret_key
```

### 3. GCP Setup (Optional but Recommended)

For Vertex AI Generative Search integration:

1. Create a GCP project
2. Enable Discovery Engine API
3. Create a data store for blog research
4. Create a search engine
5. Download service account JSON and place it at the path specified in `GOOGLE_APPLICATION_CREDENTIALS`

## Usage

### Access the Admin Dashboard

Visit `http://yoursite.com/admin` and log in with your `ADMIN_PASSWORD`.

### Create a New Blog Post

1. Click "Create New" in the dashboard
2. Enter your blog topic (e.g., "Sports Injuries Recovery Guide")
3. Click "Start Blog"
4. The system will:
   - Conduct research
   - Generate an outline
   - Display relevant keywords and sources

### Write the Blog

1. Click "Write Section" to generate each section
2. The AI will write content based on:
   - Your topic
   - Research data
   - Keywords found
   - Professional physiotherapy tone
3. Repeat until all sections are written

### Review & Assemble

1. Review all written sections
2. Click "Assemble Blog" to:
   - Combine sections
   - Generate metadata
   - Create SEO description and keywords
   - Validate content

### Publish to Wix

1. Click "Publish to Wix"
2. Blog post is automatically published to your Wix site
3. System tracks the Wix post ID for future updates

## API Endpoints

### POST /api/blog/research
Initiates research for a blog topic.

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
```

**Body:**
```json
{
  "topic": "Topic for research",
  "draftId": "optional_existing_draft_id"
}
```

**Response:**
```json
{
  "success": true,
  "draft": { /* draft object */ },
  "research": {
    "topic": "string",
    "keywords": ["keyword1", "keyword2"],
    "sources": [
      {
        "title": "string",
        "content": "string",
        "source": "string",
        "url": "string",
        "relevanceScore": 0.95
      }
    ]
  }
}
```

### POST /api/blog/write-section
Writes a single section of the blog.

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_PASSWORD
```

**Body:**
```json
{
  "draftId": "draft_id",
  "sectionTitle": "Section title",
  "sectionNumber": 1,
  "tone": "professional",
  "targetAudience": "physiotherapy patients"
}
```

### GET /api/blog/write-section?draftId=id&action=generateOutline
Generates an outline for the blog post.

### POST /api/blog/publish
Assembles the blog post into its final form.

**Body:**
```json
{
  "draftId": "draft_id"
}
```

### POST /api/blog/publish
Publishes to Wix.

**Body:**
```json
{
  "draftId": "draft_id",
  "update": false
}
```

### GET /api/wix/blog/sync
Syncs published posts with Wix.

**Headers:**
```
x-sync-secret: YOUR_BLOG_SYNC_SECRET
```

## File Structure

```
lib/blog-automation/
├── index.ts                 # Main exports
├── research.ts              # Research functionality
├── writer.ts                # Content writing with OpenAI
├── assembler.ts             # Blog post assembly
├── wix-publisher.ts         # Wix API integration
└── db.ts                    # Draft storage

app/api/blog/
├── research/route.ts        # Research endpoint
├── write-section/route.ts   # Writing endpoint
└── publish/route.ts         # Publishing endpoint

app/api/wix/blog/
└── sync/route.ts            # Wix sync endpoint

app/admin/
└── page.tsx                 # Admin dashboard UI
```

## How It Works

### Research Phase
1. User enters topic in admin dashboard
2. System extracts keywords from topic
3. Conducts Google CSE search
4. Fetches location information from Google Places
5. Stores research data in draft

### Outline Generation
1. Uses research data and topic
2. OpenAI generates 5-7 section titles
3. Displayed in admin dashboard

### Writing Phase
1. For each section:
   - Builds a prompt with topic, section title, research data, and keywords
   - Calls OpenAI GPT-4 with professional tone
   - Stores section with word count
   - Repeats for next section

### Assembly
1. Combines all sections
2. Generates metadata (SEO title, description, keywords)
3. Creates blog slug from topic
4. Calculates reading time
5. Validates content quality

### Publishing
1. Converts to Wix format
2. Calls Wix Blog API
3. Returns post URL
4. Updates draft status to "published"
5. Stores Wix post ID for future updates

## Customization

### Change AI Tone
Edit the writing prompt in `writer.ts`:
```typescript
const opts = { ...defaultOptions, ...options };
// Modify the tone parameter: "professional" | "friendly" | "expert" | "clinical"
```

### Target Word Count
Adjust in `writer.ts`:
```typescript
wordCountPerSection: 300 // Change this value
```

### Add Custom Fields
Extend `BlogPost` interface in `assembler.ts` and update the database in `db.ts`

## Troubleshooting

### "Research failed"
- Check Google CSE API key is valid
- Ensure Google CSE CX ID is correct
- Verify API quotas aren't exceeded

### "Failed to write section"
- Check OpenAI API key is valid
- Verify API quota and billing
- Ensure draft has research data

### "Failed to publish to Wix"
- Check Wix API key is valid
- Verify Wix Site ID is correct
- Ensure Wix account has blog enabled
- Check author member ID exists

### Draft not saving
- Check admin password is correct in auth header
- Verify browser localStorage is enabled

## Production Considerations

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Use proper OAuth/JWT instead of password
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **Caching**: Implement Redis for research caching
5. **Monitoring**: Add error tracking with Sentry
6. **Webhooks**: Set up Wix webhooks for real-time sync
7. **Queue**: Use Bull/RabbitMQ for async processing

## Future Enhancements

- [ ] Image generation for blog posts
- [ ] Auto-linking to related posts
- [ ] Internal link suggestions
- [ ] Grammar and tone checking
- [ ] A/B testing different content versions
- [ ] Scheduled publishing
- [ ] Blog performance analytics
- [ ] Social media auto-sharing

## License

MIT

## Support

For issues or questions, contact your development team.
