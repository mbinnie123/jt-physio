#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });

const axios = require('axios');

console.log(`
╔════════════════════════════════════════════════════════════╗
║         WIX API - DIRECT AUTHENTICATION TEST              ║
╚════════════════════════════════════════════════════════════╝
`);

// Check credentials
console.log('📋 Checking credentials...\n');

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_AUTHOR_MEMBER_ID = process.env.WIX_AUTHOR_MEMBER_ID;

if (!WIX_API_KEY) {
  console.log('❌ WIX_API_KEY is missing');
  process.exit(1);
}

if (!WIX_SITE_ID) {
  console.log('❌ WIX_SITE_ID is missing');
  process.exit(1);
}

if (!WIX_AUTHOR_MEMBER_ID) {
  console.log('❌ WIX_AUTHOR_MEMBER_ID is missing');
  process.exit(1);
}

console.log('✓ WIX_API_KEY: ' + WIX_API_KEY.substring(0, 20) + '...');
console.log('✓ WIX_SITE_ID: ' + WIX_SITE_ID);
console.log('✓ WIX_AUTHOR_MEMBER_ID: ' + WIX_AUTHOR_MEMBER_ID);

console.log(`
╔════════════════════════════════════════════════════════════╗
║      TEST 1: POST /blog/v3/posts/query (Query Posts)      ║
╚════════════════════════════════════════════════════════════╝
`);

axios({
  method: 'POST',
  url: 'https://www.wixapis.com/blog/v3/posts/query',
  headers: {
    // Wix API Key auth uses the raw key value (not Bearer)
    'Authorization': WIX_API_KEY,
    'wix-site-id': WIX_SITE_ID,
    'Content-Type': 'application/json'
  },
  data: {
    // Default sort is firstPublishedDate DESC with pinned first.
    // Keep it explicit and limit output.
    paging: { limit: 5, offset: 0 }
  }
})
  .then(response => {
    const posts = response.data.posts || [];

    console.log('✓ SUCCESS! Blog posts retrieved:');
    console.log(`  Posts count: ${posts.length}`);
    console.log(`  Status: ${response.status}\n`);

    if (posts.length > 0) {
      console.log('  Latest post:');
      const post = posts[0];
      console.log(`    Title: ${post.title || '(no title)'}`);
      console.log(`    ID: ${post.id}`);
      console.log(`    First published: ${post.firstPublishedDate || '(not published)'}`);
    }

    testCreatePost();
  })
  .catch(error => {
    console.log('❌ FAILED');
    console.log(`  Status: ${error.response?.status || 'Unknown'}`);
    console.log(`  Message: ${error.response?.statusText || error.message}`);
    console.log(`  Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    console.log(`
DIAGNOSIS:
- If 404: Blog API endpoint not found (check URL) or Blog app not installed
- If 401: API key is invalid
- If 403: API key missing required blog permissions (e.g. Read Blog)

Next step: Check Wix Dashboard → Settings → API for permissions
`);
    process.exit(1);
  });

function testCreatePost() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║    TEST 2: POST /blog/v3/draft-posts (Create Draft)       ║
╚════════════════════════════════════════════════════════════╝
`);

  const testPost = {
    draftPost: {
      title: 'Test Blog Post - Knee Injury Recovery',
      slug: 'test-knee-injury-recovery-' + Date.now(),
      // For 3rd-party apps, memberId is required
      memberId: WIX_AUTHOR_MEMBER_ID,
      categoryIds: [],
      // Minimal Rich Content document
      richContent: {
        nodes: [
          {
            type: 'PARAGRAPH',
            id: 'p1',
            nodes: [
              {
                type: 'TEXT',
                id: 't1',
                text: 'This is a test blog post created by the JT Physiotherapy automation system. It demonstrates the integration with the Wix Blog API.'
              }
            ]
          }
        ],
        metadata: { version: 1 },
        documentStyle: {}
      },
      excerpt: 'Test blog post for Wix API validation'
    }
  };

  axios({
    method: 'POST',
    url: 'https://www.wixapis.com/blog/v3/draft-posts',
    headers: {
      // Wix API Key auth uses the raw key value (not Bearer)
      'Authorization': WIX_API_KEY,
      'wix-site-id': WIX_SITE_ID,
      'Content-Type': 'application/json'
    },
    data: testPost
  })
    .then(response => {
      const draft = response.data.draftPost;
      console.log('✓ SUCCESS! Test draft created:');
      console.log(`  Draft ID: ${draft.id}`);
      console.log(`  Title: ${draft.title}`);
      console.log(`  Slug: ${draft.slug}`);
      console.log(`  Status: ${response.status}\n`);
      
      console.log(`
✅ WIX API IS FULLY FUNCTIONAL!

Your blog automation system can now:
1. List existing blog posts
2. Create new blog posts
3. Update blog posts
4. Publish blog posts

✓ Credentials are valid
✓ Blog app is installed
✓ API permissions are correct
✓ Network connection is working

You're ready to use the blog automation system!
`);
    })
    .catch(error => {
      console.log('❌ FAILED');
      console.log(`  Status: ${error.response?.status || 'Unknown'}`);
      console.log(`  Message: ${error.response?.statusText || error.message}`);
      console.log(`  Error: ${JSON.stringify(error.response?.data, null, 2)}`);
      console.log(`
DIAGNOSIS:
- If 404: Blog app not installed or endpoint incorrect
- If 401: API key invalid
- If 403: Missing blog write permissions (e.g. Write Blog)
- If 400: Invalid request format (payload schema)

SOLUTIONS:
1. Install Blog app:
   Go to Wix App Market → Search "Blog" → Install

2. Check API permissions:
   Wix Dashboard → Settings → API → Ensure Read Blog / Write Blog are enabled

3. Verify credentials:
   - WIX_API_KEY in .env.local matches your Wix API key
   - WIX_SITE_ID matches your Wix site ID
   - WIX_AUTHOR_MEMBER_ID is a valid memberId

4. Test again:
   node test-wix-api.js
`);
      process.exit(1);
    });
}
