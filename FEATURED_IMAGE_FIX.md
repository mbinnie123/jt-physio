# Featured Image Fix - Solution Summary

## Problem
Featured images were not displaying on Wix blog posts even though:
- AI image generation was working (Vertex AI Imagen)
- Images were being uploaded to GCS and made publicly accessible
- Wix API was accepting the publish requests
- Posts were published successfully to site

## Root Cause
When sending featured images to Wix via the `coverMedia` field in the Blog v3 API:
```typescript
coverMedia: {
  image: {
    url: "https://storage.googleapis.com/image-gen-jt/blog-images/..."
  }
}
```

Wix was **silently ignoring the coverMedia field**, returning only:
```json
"media": {
  "displayed": true,
  "custom": false
}
```

Without any `wixMedia` object, the image was never stored or associated with the post.

## Investigation
Testing revealed:
1. **Wix ignores common field names**: `coverMedia`, `featured_image`, `featuredImage`, `featureImage`, various other attempts
2. **Wix doesn't accept external image URLs for featured images**: Only images in Wix's Media Manager get a `wixMedia` object
3. **Wix Media Manager API is not exposed**: The Blog v3 API doesn't provide endpoints to upload images
4. **Published posts with images show `wixMedia` structure**:
   ```json
   "media": {
     "wixMedia": {
       "image": {
         "id": "93b36d_...",
         "url": "https://static.wixstatic.com/media/93b36d_...",
         "height": 1024,
         "width": 1024
       }
     },
     "displayed": true,
     "custom": false
   }
   ```

## Solution
Instead of relying on the broken `coverMedia` field, **embed the featured image as the first IMAGE node in the `richContent`**:

```typescript
function buildRichContent(post: BlogPost) {
  const nodes: WixRichTextNode[] = [];

  // Add featured image as first node
  if (post.featuredImageUrl) {
    const normalizedUrl = normalizeFeaturedImageUrl(post.featuredImageUrl);
    if (normalizedUrl) {
      nodes.push(createImageNode(normalizedUrl, post.title || "Featured image"));
    }
  }

  // ... rest of content
  return { nodes, metadata, documentStyle };
}

function createImageNode(url: string, altText?: string): WixRichTextNode {
  return {
    id: nextNodeId("image"),
    type: "IMAGE",
    imageData: {
      image: {
        src: { url: url }
      },
      altText: altText || "Image"
    }
  };
}
```

### Why This Works
1. **Wix preserves IMAGE nodes**: Testing confirmed IMAGE nodes with external GCS URLs survive the publish process
2. **Frontend already handles IMAGE nodes**: The blog page render function (`ricosToHtml()`) correctly displays IMAGE nodes
3. **No dependency on Wix Media Manager**: Works with permanent public GCS URLs
4. **Proper alt text support**: IMAGE nodes support altText for accessibility

## Changes Made
- **File**: `lib/blog-automation/wix-publisher.ts`
- **Changes**:
  1. Removed `coverMedia` field from `WixDraftPostPayload` interface
  2. Added `createImageNode()` function to create IMAGE nodes with GCS URLs
  3. Modified `buildRichContent()` to prepend featured image as first node
  4. Simplified `buildDraftPayload()` - removed non-functional coverMedia logic
  5. Cleaned up logging - removed coverMedia-related debug output

## Testing Results
✅ **Verified working**:
- IMAGE nodes with GCS URLs are preserved after publishing
- IMAGE nodes appear in the  `richContent.nodes` array when fetched
- Frontend correctly renders IMAGE nodes

## Benefits
- ✅ Featured images now display on all published posts
- ✅ Uses permanent GCS URLs (no expiration)
- ✅ No dependency on Wix Media Manager
- ✅ Simpler implementation
- ✅ Works with existing image pipeline (Vertex AI → GCS → publish)

## Implementation Notes
- Images are positioned at the top of the post content
- Blog pages fetch posts with `fieldsets=RICH_CONTENT` to get the IMAGE nodes
- The `ricosToHtml()` function already has logic to handle IMAGE nodes properly
- ALT text is set to the post title for accessibility

## Rollout
- Commit: `Fix featured images: embed as IMAGE nodes instead of coverMedia`
- All future posts published will have featured images displayed
- No migration needed for existing posts (they use Wix Media Manager images)
