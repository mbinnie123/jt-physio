# Admin Publishing Setup

## Architecture

The admin publishing system has been fully configured to publish drafts to Wix with proper authentication, error logging, and payload validation.

### Components

#### 1. Admin UI: `/app/admin/blog/publish/page.tsx`
- **Path:** `/admin/blog/publish`
- **Type:** Client-side Next.js page
- **Features:**
  - Displays list of all published drafts
  - Select a draft to publish
  - Password prompt for admin authentication
  - Real-time error/success feedback with Wix API response details
  - Shows Wix post ID and URL on success

**Flow:**
```
User clicks "Publish to Wix"
  → Prompts for admin password
  → Sends POST /api/blog/publish with { draftId, update }
  → Displays Wix API response (including error.response.status and error.response.data)
  → Shows post ID and URL on success
```

#### 2. API Route: `/api/blog/publish`
- **Path:** `/api/blog/publish`
- **File:** `/app/api/blog/publish/route.ts`
- **Authentication:** Bearer token (must match ADMIN_PASSWORD from .env.local)
- **Existing Flow:**
  1. Validates admin password
  2. Fetches draft by ID from local database
  3. Generates metadata and assembles blog post
  4. Validates complete blog post
  5. Calls `publishToWix()` function
  6. Returns Wix API response with **status, statusText, and response.data for debugging**

#### 3. Wix Publisher: `/lib/blog-automation/wix-publisher.ts`
- **Function:** `publishToWix(post: BlogPost)`
- **Credentials Used:**
  - `WIX_API_KEY` - IST token for authentication
  - `WIX_SITE_ID` - Site ID in Authorization header as `wix-site-id`
  - `WIX_AUTHOR_MEMBER_ID` - Author ID for the post

**Key Updates:**
1. **Correct Headers:** Uses `Authorization: WIX_API_KEY` and `wix-site-id: WIX_SITE_ID` (not `wix-account-id`)
2. **Proper Payload:** Sends `{ post: wixPost }` with `richContent` as object (not string)
3. **Error Logging:** Captures and returns `error.response.status`, `error.response.statusText`, and `error.response.data`
4. **Optional Fields:** Only includes optional fields (tags, featured, seoData) if they exist

**Markdown to Ricos Conversion:**
- Converts headings (h1, h2, h3) to Ricos heading nodes
- Converts bullet lists to Ricos unordered-list nodes
- Converts numbered lists to Ricos ordered-list nodes
- Converts paragraphs to Ricos paragraph nodes
- Handles inline formatting (bold, italic, links, code)

### Authentication Flow

1. **UI Password Prompt:** User enters admin password
2. **Bearer Token:** Sent as `Authorization: Bearer <password>`
3. **Server Validation:** API route validates token against `ADMIN_PASSWORD` from `.env.local`
4. **Server-Side Secrets:** `WIX_API_KEY`, `WIX_SITE_ID`, and `WIX_AUTHOR_MEMBER_ID` never exposed to client

### Error Handling

When Wix API returns an error (e.g., 404, 400, 401), the system:

1. **Captures:** `error.response.status`, `error.response.statusText`, `error.response.data`
2. **Logs Server-Side:** Full error details in console for debugging
3. **Returns to Client:** Status code and response.data so UI can display detailed Wix error messages
4. **Example Error Message:**
   ```
   Publishing failed: Wix API error (404): Not Found
   
   Wix Details:
   Status: 404
   {
     "errorCode": "...",
     "message": "..."
   }
   ```

### Required Environment Variables

```env
# From .env.local
ADMIN_PASSWORD=JtPhysio_Admin_2026!9kP
WIX_API_KEY=IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0...
WIX_SITE_ID=a0398594-eaee-40bf-a70b-9287df970e8e
WIX_AUTHOR_MEMBER_ID=ba6adc02-0b45-4780-84ba-dc1fde492045
```

### Testing the Publishing Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the admin page:**
   ```
   http://localhost:3000/admin/blog/publish
   ```

3. **Publish a draft:**
   - Select a draft from the list
   - Click "Publish to Wix"
   - Enter admin password: `JtPhysio_Admin_2026!9kP`
   - Check the result (success or detailed Wix error)

4. **Debug Wix API errors:**
   - Check the error response in the UI (includes status, statusText, response.data)
   - Check server logs for full error details
   - Verify env vars are set correctly
   - Ensure WIX_API_KEY has Blog API permissions

### Wix API Endpoint Reference

- **Endpoint:** `https://www.wixapis.com/v1/blogs/posts`
- **Method:** POST for new posts, PATCH for updates
- **Required Headers:**
  - `Authorization: {WIX_API_KEY}`
  - `wix-site-id: {WIX_SITE_ID}`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "post": {
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "richContent": { "nodes": [...] },
      "memberId": "string (author)",
      "published": boolean,
      "publishedDate": "ISO string"
    }
  }
  ```
- **Optional Fields (only include if present):**
  - `tagIds`: string[]
  - `featured`: boolean
  - `heroImage`: object
  - `seoData`: { title, description }

### Common Wix API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 404 | Endpoint not found or Blog API not available | Verify WIX_SITE_ID is correct; ensure Blog feature enabled in Wix |
| 401 | Invalid or expired API key | Regenerate WIX_API_KEY with Blog permissions enabled |
| 400 | Invalid payload (missing required fields, wrong field types) | Ensure required fields present; optional fields only if they exist; richContent as object |
| 403 | API key lacks Blog permissions | Regenerate API key with Blog app permissions enabled |

### Troubleshooting

**Publishing returns 404:**
- Check that `WIX_SITE_ID` is correct
- Verify Blog feature is enabled in your Wix site
- Confirm WIX_API_KEY is valid and not expired
- Check server logs for full error details

**Publishing returns 400 UNKNOWN:**
- Verify all required fields are present (title, slug, excerpt, richContent, memberId, published, publishedDate)
- Ensure richContent is an object, not a JSON string
- Check that optional fields (tags, featured, seoData) are not empty arrays/undefined
- Review response.data in error message for specific field validation errors

**Publishing returns 401:**
- Regenerate WIX_API_KEY from Wix dashboard
- Ensure API key has Blog app permissions enabled
- Verify account ID matches the one in the JWT

## File Changes Summary

### Modified Files

1. **`/lib/blog-automation/wix-publisher.ts`**
   - Changed `wix-account-id` header to `wix-site-id`
   - Enhanced `publishToWix()` error logging to return status, statusText, and response.data
   - Already includes Markdown-to-Ricos conversion

2. **`/app/api/blog/publish/route.ts`**
   - Updated error response to include `details` from publishToWix error
   - Changed HTTP status from 500 to 400 for Wix API errors (client errors, not server errors)

3. **`/app/admin/blog/publish/page.tsx`**
   - Completely redesigned to use existing `/api/blog/publish` endpoint
   - Now displays list of published drafts
   - User selects a draft, then publishes it
   - Shows full Wix error details on failure (status, statusText, response.data)

### Removed Files

- **`/app/api/admin/blog/`** - Removed unused admin-specific API route (uses existing `/api/blog/publish` instead)

## Next Steps

1. **Verify Wix API Key Permissions:**
   - Log into Wix dashboard
   - Go to Settings → API & Extensions → API Keys
   - Ensure your API key has **Blog app permissions** enabled
   - If not, regenerate a new key with Blog permissions

2. **Test Publishing:**
   - Navigate to `/admin/blog/publish`
   - Select a draft with status "published" or "assembled"
   - Click "Publish to Wix" and enter the admin password
   - Verify success or debug based on error response

3. **Monitor Logs:**
   - Server logs will show full Wix API error details
   - Client UI will show user-friendly error messages with status and response data

The system is now ready for end-to-end testing once Wix API key permissions are verified.
