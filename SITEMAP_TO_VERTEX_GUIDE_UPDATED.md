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

## Method 1: Using the CLI Script ✅ Working!

```bash
# Sequential import
node add-sitemap-to-vertex.js

# Batch import with rate limiting (5 URLs at a time, 500ms delay)
node add-sitemap-to-vertex.js --batch --size 5 --delay 500
```

**Status:** ✅ **All 5 URLs successfully imported to Vertex Data Store!**

The script:
- Authenticates with Google Cloud automatically
- Reads your `shoulder-urls-sitemap.xml` file
- Imports each URL as a document to Vertex
- Handles errors gracefully
- Provides import status and timing information
- Ready for batch imports with rate limiting

### Example Output:
```
✓ https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/...
✓ https://bess.ac.uk/exercises-for-shoulder-pain/
✓ https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/
✓ https://www.cirencesterphysiotherapycentre.co.uk/...
✓ https://dinesorthopedics.com/...

============================================================
✅ Import complete: 5/5 successful
💡 Note: Indexing may take a few minutes.
============================================================
```

---

## Method 2: Using the Web Crawler (Alternative)

If you prefer to use Vertex's built-in web crawler:

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. In the **Preview** tab, click **Add source**
5. Choose **Website crawl**
6. Enter your site URL or sitemap location
7. Click **Crawl** - it will auto-discover and index all URLs
8. Indexing typically completes within 10-30 minutes

**Advantages:**
- No CLI required
- Automatic URL discovery
- Handles redirects and site structure
- Good for large sites

---

## Method 3: Using the REST API

If you want to import programmatically via HTTP:

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

---

## Verification

Once you've imported the URLs, verify they're in your Vertex Data Store:

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **Search and Conversation** > **Data Stores**
3. Select your data store
4. Go to **Preview** tab
5. You should see the imported documents listed
6. Try running a test search to verify they're indexed

### Check via API

```bash
curl http://localhost:3000/api/sitemap?format=strings
```

This shows all URLs currently in your sitemap file.

---

## Files and Utilities

- **[lib/sitemap.ts](../../lib/sitemap.ts)** - Utility to read and parse sitemaps
- **[lib/vertex-import.ts](../../lib/vertex-import.ts)** - Vertex import functions
- **[app/api/sitemap/route.ts](../../app/api/sitemap/route.ts)** - API to retrieve sitemap URLs
- **[app/api/sitemap/vertex/route.ts](../../app/api/sitemap/vertex/route.ts)** - API to import to Vertex
- **[add-sitemap-to-vertex.js](../../add-sitemap-to-vertex.js)** - CLI script for imports
- **[shoulder-urls-sitemap.xml](../../shoulder-urls-sitemap.xml)** - Your sitemap with shoulder exercise URLs

---

## Troubleshooting

### Script runs but shows 404 errors?

If you see 404 errors:
1. Check that `GCP_LOCATION` in `.env.local` is set correctly (often `global` or a region like `europe-west1`)
2. Verify permissions were granted:
   ```bash
   gcloud projects add-iam-policy-binding jt-football-physiotherapy \
     --member=serviceAccount:wix-blog-generator@jt-football-physiotherapy.iam.gserviceaccount.com \
     --role=roles/discoveryengine.editor
   ```
3. Try using the Web Crawler method instead

### Can't find the imported URLs?

- Check Vertex console **Preview** tab to see indexed documents
- Wait a few minutes - indexing takes time
- Try a simple search to verify documents are being indexed
- Check Google Cloud logs for any import errors

### Need to import additional URLs later?

Just add them to `shoulder-urls-sitemap.xml` and run:
```bash
node add-sitemap-to-vertex.js
```

---

## Next Steps

1. ✅ **Import complete** - URLs are now in Vertex Data Store
2. **Wait for indexing** - Takes 5-30 minutes depending on content size
3. **Verify in console** - Check Vertex AI > Data Store > Preview
4. **Test search** - Try searching for keywords from your URLs
5. **Update your search** - Vertex can now use these indexed docs for answers

---

## Support

For issues with Vertex:
- [Google Vertex AI Search Documentation](https://cloud.google.com/generative-ai-app-builder/docs)
- [Discovery Engine API Reference](https://cloud.google.com/discovery-engine/docs)
- [Google Cloud Console](https://console.cloud.google.com/) - Check API logs
