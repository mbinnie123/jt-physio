#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

console.log(`\n╔════════════════════════════════════════════════════════════╗\n║         WIX BLOG API v3 TESTER                            ║\n╚════════════════════════════════════════════════════════════╝\n`);

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_AUTHOR_MEMBER_ID = process.env.WIX_AUTHOR_MEMBER_ID;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error('❌ Missing WIX_API_KEY or WIX_SITE_ID in .env.local');
  process.exit(1);
}
if (!WIX_AUTHOR_MEMBER_ID) {
  console.error('❌ Missing WIX_AUTHOR_MEMBER_ID in .env.local');
  process.exit(1);
}

const wixHeaders = {
  'Authorization': WIX_API_KEY, // No Bearer prefix
  'wix-site-id': WIX_SITE_ID,
  'Content-Type': 'application/json'
};

async function listPosts() {
  console.log('\n📡 Listing blog posts...');
  try {
    const response = await axios.post(
      'https://www.wixapis.com/blog/v3/posts/query',
      { query: {}, paging: { limit: 5 } },
      { headers: wixHeaders }
    );
    console.log('✓ Posts listed:', response.data.posts?.length || 0);
    if (response.data.posts && response.data.posts.length > 0) {
      response.data.posts.forEach((post, idx) => {
        console.log(`  ${idx + 1}. ${post.title} (ID: ${post.id})`);
      });
    }
  } catch (error) {
    printError(error);
    process.exit(1);
  }
}

async function createDraftPost() {
  console.log('\n📡 Creating a draft blog post...');
  const draftPost = {
    title: 'Test Blog Post - Knee Injury Recovery',
    authorId: WIX_AUTHOR_MEMBER_ID,
    richContent: {
      nodes: [
        {
          type: 'paragraph',
          nodes: [
            {
              type: 'text',
              text: 'This is a test blog post created by the JT Physiotherapy automation system. It demonstrates the integration with Wix Blog API v3.'
            }
          ]
        }
      ]
    },
    excerpt: 'Test blog post for Wix API v3 validation',
    published: false
  };
  try {
    const response = await axios.post(
      'https://www.wixapis.com/blog/v3/draft-posts',
      { draftPost },
      { headers: wixHeaders }
    );
    console.log('✓ Draft post created:');
    console.log(`  ID: ${response.data.draftPost.id}`);
    console.log(`  Title: ${response.data.draftPost.title}`);
    console.log(`  Author: ${response.data.draftPost.authorId}`);
    console.log(`  Published: ${response.data.draftPost.published}`);
  } catch (error) {
    printError(error);
    process.exit(1);
  }
}

function printError(error) {
  const status = error.response?.status || 'Unknown';
  const message = error.response?.statusText || error.message;
  console.log(`❌ FAILED (${status}: ${message})`);
  if (error.response?.data) {
    console.log('Error details:', JSON.stringify(error.response.data, null, 2));
  }
}

(async () => {
  await listPosts();
  await createDraftPost();
})();
