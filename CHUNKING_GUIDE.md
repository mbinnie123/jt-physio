# Chunked Content Indexing for Vertex AI Search

This approach improves search quality by splitting content into semantic chunks with rich metadata for better relevance.

## How It Works

1. **Fetches** content from shoulder exercise URLs
2. **Extracts** plain text from HTML using cheerio
3. **Splits** content into overlapping chunks (~800 words each)
4. **Enriches** each chunk with metadata:
   - Excerpt (first meaningful sentences)
   - Keywords (extracted + source keywords)
   - Source information
   - Chunk index
   - Content type and language

5. **Imports** chunks to Vertex Data Store

## Why This Approach?

✅ **Better Search Relevance** - More specific content matches  
✅ **Metadata Enrichment** - Keywords help Vertex understand context  
✅ **Chunking** - Long documents split for better partial-matching  
✅ **Overlap** - Maintains context between chunks  
✅ **Flexible Output** - Can save locally, upload to GCS, or import directly

## Usage

### Option 1: Direct Import to Vertex (Fastest)
```bash
node chunk-and-index-resources.js
```
Fetches → Chunks → Indexes directly to Vertex

### Option 2: Save Locally First
```bash
node chunk-and-index-resources.js --save
```
Outputs `shoulder-chunks.ndjson` for inspection

### Option 3: Upload to GCS First
```bash
node chunk-and-index-resources.js --gcs
```
Uploads to GCS, then import using:
```bash
node import-from-gcs.js shoulder-chunks-*.ndjson
```

## Example Output

Each chunk becomes a document like:

```json
{
  "id": "chunk-1234567890-nhsaaa-0",
  "structData": {
    "title": "NHS - Shoulder Exercises... (Part 1/5)",
    "url": "https://www.nhsaaa.net/...",
    "source": "NHS AAA",
    "content": "The actual chunk text here...",
    "excerpt": "Introduction excerpt of the page...",
    "keywords": "shoulder, exercises, rehabilitation, physio, pain",
    "chunkIndex": 0,
    "totalChunks": 5,
    "contentType": "exercise-guide",
    "language": "en",
    "indexed_at": "2026-02-23T10:30:00.000Z"
  }
}
```

## Configuration

### Adjust Chunk Size
Edit constants in the script:
```javascript
const CHUNK_SIZE = 800;      // words per chunk
const CHUNK_OVERLAP = 100;   // overlap between chunks
const MIN_CHUNK_SIZE = 200;  // minimum chunk word count
```

Smaller chunks = more specific matches but more documents
Larger chunks = broader context but fewer documents
Overlap = helps maintain semantic continuity

### Add More URLs
Add entries to `SHOULDER_URLS`:
```javascript
{
  url: 'https://example.com/guide',
  title: 'Guide Title',
  source: 'Source Name',
  keywords: ['keyword1', 'keyword2']
}
```

## Verification

After import, verify chunks are indexed:

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Select your data store
3. Go to **Preview** tab
4. Search for keywords like "shoulder" or "exercises"
5. Should see multiple results from the same source (different chunks)

## Performance

- **Fetching**: ~2-5 seconds per URL (network dependent)
- **Chunking**: ~0.1s for full extraction
- **Import**: ~5-10 seconds for ~50-100 chunks

Total: ~30-60 seconds for all resources

## Troubleshooting

### No chunks created
- URL might not be accessible or return 404
- Check console output for fetch errors
- Verify URLs in `SHOULDER_URLS` are still valid

### Import fails with 404
- Same Vertex data store configuration limitation
- Try `--gcs` option instead for indirect import
- Or use the Web Crawler method in Vertex console

### Chunks too small/large
- Adjust `CHUNK_SIZE` constant
- Increase `MIN_CHUNK_SIZE` to filter tiny chunks
- Adjust `CHUNK_OVERLAP` for better continuity

### Need to update indexed content
- Re-run the script to fetch fresh content
- Old chunks will remain; new versions will be added
- Consider cleanup script if chunks accumulate
