#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID');
  process.exit(1);
}

const wixHeaders = {
  'Authorization': WIX_API_KEY,
  'wix-site-id': WIX_SITE_ID,
  'Content-Type': 'application/json'
};

async function queryPublishedPosts() {
  console.log('\n📡 Querying published blog posts to see media structure...\n');
  try {
    const response = await axios.post(
      'https://www.wixapis.com/blog/v3/posts/query',
      {
        query: {},
        paging: { limit: 5 }
      },
      { headers: wixHeaders }
    );

    const posts = response.data?.posts || [];
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    // Print first post with full media structure
    console.log('First published post:');
    console.log('====================================');
    const post = posts[0];
    console.log('ID:', post.id);
    console.log('Title:', post.title);
    console.log('\nFull media object:');
    console.log(JSON.stringify(post.media, null, 2));
    console.log('\n====================================');

    // Check multiple posts to see patterns
    console.log('\nMedia field status for all posts:');
    posts.forEach((p, idx) => {
      console.log(`\n${idx + 1}. "${p.title}"`);
      if (p.media) {
        console.log('   Fields:', Object.keys(p.media).join(', '));
        console.log('   media:', JSON.stringify(p.media));
      } else {
        console.log('   (no media object)');
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

queryPublishedPosts();
