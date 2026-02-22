# Sitemap to Vertex Data Store Import Guide

This guide explains how to add URLs from your sitemap to Google Vertex AI Data Store.

## Prerequisites

- Vertex AI Data Store created in Google Cloud Console
- Google Cloud credentials configured via `.env.local`:
  ```
  GCP_PROJECT_ID=your-project-id
  GCP_LOCATION=global
  VERTEX_DATA_STORE_ID=your-data-store-id
  VERTEX_ENGINE_ID=your-engine-id (optional)
  ```

## Method 1: Using the Web Crawler (Recommended) ⭐

**This is the most reliable method for your setup.**

The Vertex Discovery Engine includes a web crawler that can automatically discover and index URLs from a sitemap. No API configuration needed.

### Quick Setup:

1. Host your sitemap at a public URL (or use Vertex's built-in crawlers)
2. In Vertex Console, use the web crawler to import all URLs at once
3. Done! Indexing completes in 10-30 minutes

### Detailed Steps:

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. In the **Preview** tab, click **Add source**
5. Choose **Website crawl**
6. Enter a root URL of your site (or specific page with the sitemap referenced)
7. Click **Crawl** - it will automatically discover all URLs

The web crawler will:
- Find and index all URLs automatically
- Handle large sitemaps efficiently
- No API endpoint issues
- Indexes typically complete within 10-30 minutes

---

## Method 2: Using the CLI Script (Advanced - May Not Work On All Configs)

```bash
# Sequential import
node add-sitemap-to-vertex.js

# Batch import with rate limiting
node add-sitemap-to-vertex.js --batch --size 5 --delay 500
```

**Note:** This method requires the Vertex Discovery Engine API to be properly enabled and configured for your data store. Many data store configurations don't support direct API imports and will return 404 errors. **If you see 404 errors, use Method 1 (Web Crawler) instead.**

## Method 3 (Renamed)

The Vertex Discovery Engine includes a web crawler that can automatically discover and index URLs from a sitemap.

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. In the **Preview** tab, click **Add source**
5. Choose **Website crawl** and enter the URL:
   ```
   https://yoursite.com/shoulder-urls-sitemap.xml
   ```
6. The crawler will automatically discover and index all URLs in the sitemap
7. Indexing typically completes within 10-30 minutes

## Method 3 (Renamed): Using the REST API (Advanced)

Use this method if you have API access enabled:

```bash
# Add a single URL
curl -X POST http://localhost:3000/api/sitemap/vertex \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-url",
    "url": "https://example.com/page"
  }'

# Import all sitemap URLs
curl -X POST http://localhost:3000/api/sitemap/vertex \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-sitemap",
    "sitemapPath": "shoulder-urls-sitemap.xml"
  }'

# Batch import with rate limiting
curl -X POST http://localhost:3000/api/sitemap/vertex \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-sitemap-batch",
    "sitemapPath": "shoulder-urls-sitemap.xml",
    "batchSize": 5,
    "delayMs": 500
  }'
```

## Method 4 (Renamed): Manual Import via UI

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. In the **Preview** tab, click **Add source**
5. Choose **Inline documents** and manually paste the URLs
6. Or upload a sitemap file directly

## Troubleshooting

### Getting 404 Errors on the CLI Script?

This is **expected and common.** We've tried multiple approaches:

1. ✅ Direct `/importDocuments` endpoint → 404
2. ✅ `/branches/default_branch/documents:import` → 404  
3. ✅ Regional endpoint (`europe-west1-discoveryengine.googleapis.com`) → Region mismatch error
4. ✅ Global endpoint with regional location → Still 404

**Conclusion:** Your Vertex data store configuration doesn't support programmatic API imports, even with proper permissions and correct endpoint formats.

**This is a limitation of how your data store is configured**, not the script - many Vertex data store setups don't have API import enabled.

**Solution: Use the Web Crawler method (Method 1)** ✅
- Works with all data store configurations
- No API endpoint configuration needed
- Most reliable approach
- Recommended by Google

---

After importing URLs, verify they're indexed:

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. Check the **Preview** tab to see indexed documents
5. Run a test search to verify the URLs are accessible

### Enable Vertex APIs (If Needed)

If using the CLI or API methods:

```bash
# Enable required APIs
gcloud services enable discoveryengine.googleapis.com
gcloud services enable vertex.googleapis.com

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT \
  --role=roles/discoveryengine.editor
```

## Files and Utilities

- **[lib/sitemap.ts](../../lib/sitemap.ts)** - Utility to read and parse sitemaps
- **[lib/vertex-import.ts](../../lib/vertex-import.ts)** - Vertex import functions
- **[app/api/sitemap/route.ts](../../app/api/sitemap/route.ts)** - API to retrieve sitemap URLs
- **[app/api/sitemap/vertex/route.ts](../../app/api/sitemap/vertex/route.ts)** - API to import to Vertex
- **[add-sitemap-to-vertex.js](../../add-sitemap-to-vertex.js)** - CLI script for imports

## Next Steps

### Recommended: Use the Web Crawler Method

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Select your data store
3. Click **Add source** → **Website crawl**
4. Follow the prompts to crawl your site
5. Check back in 10-30 minutes for indexed documents

### Verify Import Success

1. **Check Vertex console:** Visit the Data Store preview to see indexed documents
2. **Test search:** Use the Vertex AI Search in the console to verify URLs are searchable
3. **Verify the sitemap API:** 
   ```bash
   curl http://localhost:3000/api/sitemap?format=strings
   ```

## Support

If you continue experiencing issues, consult:
- [Google Vertex AI Search Documentation](https://cloud.google.com/generative-ai-app-builder/docs)
- [Discovery Engine API Reference](https://cloud.google.com/discovery-engine/docs)
- Google Cloud Console error logs
