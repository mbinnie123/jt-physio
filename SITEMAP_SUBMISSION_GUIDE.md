# Vertex AI Search - Official Sitemap Submission Guide

## Overview

This guide explains how to submit your sitemap to Vertex AI Search using the official API instead of importing individual URLs as documents. Vertex will automatically crawl, index, and maintain your pages.

## Key Differences

### Previous Approach (Documents Import)
- ✅ Manual control over each URL
- ✅ Structured data fields (title, content, etc.)
- ⏱️ You control what goes in
- ❌ Limited to 5 URLs for shoulder content
- ❌ No automatic updates when pages change

### Official Sitemap Approach
- ✅ Automatic crawling and indexing
- ✅ Automatic daily refresh of updated pages
- ✅ Automatic 14-day refresh of unchanged pages
- ✅ Scales to thousands of URLs
- ✅ Vertex manages index freshness
- ❌ Less control over individual doc fields

## Prerequisites

1. **Publicly Accessible Sitemap**
   - Your sitemap must be accessible via a public URL
   - The URL must be reachable from Google Cloud

2. **Sitemap Format**
   - Must be standard XML sitemap protocol
   - Your `shoulder-urls-sitemap.xml` already meets this requirement

3. **Domain Verification** (may be required)
   - If indexing from your own domain, it may need verification
   - For external domains, generally not required

## Setup Steps

### 1. Make Sitemap Publicly Available

The sitemap has been copied to `public/shoulder-urls-sitemap.xml`:

```bash
# Already done - sitemap is now in:
/public/shoulder-urls-sitemap.xml
```

When your Next.js app is deployed or running, it will be accessible at:
- **Production**: `https://yourdomains.com/shoulder-urls-sitemap.xml`
- **Local Dev**: `http://localhost:3000/shoulder-urls-sitemap.xml`

### 2. Submit the Sitemap

Use the provided script:

```bash
# For production deployment
node submit-sitemap-to-vertex.js https://yourdomain.com/shoulder-urls-sitemap.xml

# For local testing (if running Next.js dev server on port 3000)
# First, ensure your dev server is running in another terminal:
npm run dev

# Then in another terminal:
node submit-sitemap-to-vertex.js http://localhost:3000/shoulder-urls-sitemap.xml
```

### 3. What Happens Next

After submission, Vertex will:
1. **Crawl** the pages in your sitemap
2. **Index** the content (typically a few hours for small sitemaps)
3. **Monitor for Changes** 
   - Daily check for any updates, additions, or deletions
   - Check `lastmod` field in sitemap
   - Refresh unchanged pages every 14 days

## Script Output Example

```
📋 Submitting sitemap to Vertex AI Search...
   Project: jt-football-physiotherapy
   Data Store: blog-research-index_1771434940842
   Location: global
   Sitemap URI: https://yourdomain.com/shoulder-urls-sitemap.xml

📋 Checking sitemaps already in data store...

📊 Existing sitemaps in data store:
No sitemaps currently in data store

✅ Sitemap submitted successfully!

📊 Response:
{
  "name": "projects/.../sitemaps/...",
  "uri": "https://yourdomain.com/shoulder-urls-sitemap.xml",
  "createTime": "2026-02-22T..."
}

⏱️ Vertex will now:
   1. Crawl the pages listed in your sitemap
   2. Index the content (takes a few hours on average)
   3. Daily refresh any updated/added/deleted URLs
   4. Refresh unchanged URLs every 14 days
```

## Monitoring & Management

### View Submitted Sitemaps

The script automatically shows all sitemaps already in your data store when you run it.

### Update Your Sitemap

If you update `shoulder-urls-sitemap.xml`:
1. Update the file in `public/shoulder-urls-sitemap.xml`
2. Update the `lastmod` field for changed URLs
3. Vertex will detect changes within 24 hours
4. You can optionally re-submit with the script to trigger immediate processing

### Remove a Sitemap

```bash
# Query the Vertex API to get the sitemap ID, then:
curl -X DELETE \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "X-Goog-User-Project: PROJECT_ID" \
  "https://discoveryengine.googleapis.com/v1/projects/PROJECT_ID/locations/global/collections/default_collection/dataStores/DATA_STORE_ID/siteSearchEngine/sitemaps/SITEMAP_ID"
```

## Technical Details

### API Endpoint Used
```
POST /projects/{projectId}/locations/global/collections/default_collection/dataStores/{dataStoreId}/siteSearchEngine/sitemaps?sitemap.uri={SITEMAP_URI}
```

### Current Configuration
- **Project**: jt-football-physiotherapy
- **Data Store**: blog-research-index_1771434940842
- **Location**: global
- **Sitemap File**: shoulder-urls-sitemap.xml (5 URLs)
- **Public Path**: /shoulder-urls-sitemap.xml

### Vertex Indexing Timeline
- **Submission**: Immediate
- **Crawling**: Starts within minutes
- **Initial Indexing**: Few hours (5 URLs will be quick)
- **Daily Refresh**: Checks for updates to lastmod field
- **Periodic Refresh**: Every 14 days for unchanged URLs

## Next Steps

1. **Deploy your Next.js app** to a publicly accessible URL, OR
2. **Use your current domain** if already deployed
3. **Run the submission script** with your public sitemap URL
4. **Wait for indexing** to complete (typically 2-4 hours for 5 URLs)
5. **Verify in Vertex console** by checking indexed documents

## Troubleshooting

### "Sitemap URI is not publicly accessible"
- Ensure your sitemap URL can be accessed from the public internet
- Check that `public/shoulder-urls-sitemap.xml` exists
- Test with curl: `curl https://yourdomain.com/shoulder-urls-sitemap.xml`

### "Data store not found" or 404 errors
- Verify PROJECT_ID and VERTEX_DATA_STORE_ID in `.env.local`
- Ensure Vertex APIs are enabled in GCP Console

### "Authorization failed"
- Verify service account has `roles/discoveryengine.editor` permission
- Check GOOGLE_APPLICATION_CREDENTIALS points to valid credentials

## Comparing Approaches

| Feature | Document Import | Sitemap Submission |
|---------|-----------------|-------------------|
| URL Count | Limited (5) | Unlimited |
| Update Frequency | Manual | Automatic (daily) |
| Indexing Control | Full control | Vertex controlled |
| Setup Complexity | Medium | Low |
| Best For | Curated content | General indexing |
| Fresh Content | Manual | Automatic |

---

**Status**: Ready to submit sitemap to Vertex AI Search
**Files**: `submit-sitemap-to-vertex.js`, `public/shoulder-urls-sitemap.xml`
