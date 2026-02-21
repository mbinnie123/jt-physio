# Blog Automation Generator - Quick Reference

## Access Admin Dashboard
```
http://localhost:3000/admin
```
**Password:** `JtPhysio_Admin_2026!9kP` (from .env.local)

## API Base URL
```
http://localhost:3000/api
```

## Quick API Examples

### 1. Research a Topic
```bash
curl -X POST http://localhost:3000/api/blog/research \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Your Blog Topic"}'
```

### 2. Generate Outline
```bash
curl -X GET "http://localhost:3000/api/blog/write-section?draftId=DRAFT_ID&action=generateOutline" \
  -H "Authorization: Bearer YOUR_PASSWORD"
```

### 3. Write Section
```bash
curl -X POST http://localhost:3000/api/blog/write-section \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "draftId": "DRAFT_ID",
    "sectionTitle": "Section Title",
    "sectionNumber": 1
  }'
```

### 4. Assemble Blog
```bash
curl -X POST http://localhost:3000/api/blog/publish \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"draftId": "DRAFT_ID"}'
```

### 5. Publish to Wix
```bash
curl -X POST http://localhost:3000/api/blog/publish \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"draftId": "DRAFT_ID"}'
```

## Blog Statuses
- **draft**: Initial creation
- **writing**: Research completed, sections being written
- **assembled**: All sections combined, ready to publish
- **published**: Published to Wix

## File Locations
- Admin Dashboard: `app/admin/page.tsx`
- API Routes: `app/api/blog/` and `app/api/wix/`
- Utilities: `lib/blog-automation/`
- Documentation: `BLOG_AUTOMATION_README.md`

## Environment Variables Required
```env
GOOGLE_PLACES_API_KEY
GOOGLE_PLACE_ID
GOOGLE_CSE_API_KEY
GOOGLE_CSE_CX
OPENAI_API_KEY
WIX_API_KEY
WIX_SITE_ID
WIX_ACCOUNT_ID
WIX_AUTHOR_MEMBER_ID
ADMIN_PASSWORD
BLOG_SYNC_SECRET
```

## Key Features
✅ AI-powered research
✅ Automatic outline generation
✅ GPT-4 content writing
✅ SEO metadata generation
✅ Direct Wix publishing
✅ Beautiful admin dashboard
✅ Draft management
✅ Real-time progress tracking

## Troubleshooting
1. Check `.env.local` has all required variables
2. Verify API keys are valid
3. Ensure npm packages are installed: `npm install`
4. Check browser console for errors
5. Use `scripts/test-blog-api.sh` to test API flow

## Next Steps
1. Test with admin dashboard
2. Create your first blog post
3. Monitor Wix for published content
4. Adjust tone/audience in API calls as needed
5. Set up production database
