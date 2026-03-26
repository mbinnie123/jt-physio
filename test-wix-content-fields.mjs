#!/usr/bin/env node

// Test script to check what content fields Wix actually returns
import axios from 'axios';

const API_KEY = 'JtPhysio_Admin_2026!9kP'; // IST token, no Bearer prefix
const SITE_ID = 'a0398594-eaee-40bf-a70b-9287df970e8e';
const WIX_API_BASE = 'https://www.wixapis.com';

async function testWixContentFields() {
  try {
    console.log('🔍 Fetching Wix posts list...');
    
    // First get list of posts
    const listResponse = await axios.get(`${WIX_API_BASE}/blog/v3/posts?limit=10`, {
      headers: {
        Authorization: API_KEY,
        'wix-site-id': SITE_ID,
      },
      timeout: 15000,
    });

    const posts = listResponse.data.posts || [];
    console.log(`✅ Found ${posts.length} posts`);
    
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    // Test detail fetch on first post
    const firstPost = posts[0];
    console.log(`\n📄 Testing detail fetch for first post: "${firstPost.title}" (ID: ${firstPost.id})`);
    console.log('');
    
    const detailResponse = await axios.get(`${WIX_API_BASE}/blog/v3/posts/${firstPost.id}`, {
      headers: {
        Authorization: API_KEY,
        'wix-site-id': SITE_ID,
      },
      timeout: 15000,
    });

    const post = detailResponse.data.post || detailResponse.data;
    
    console.log('📋 Fields in detailed response:');
    const contentFields = Object.keys(post).filter(k => 
      ['richContent', 'content', 'body', 'htmlBody', 'plainContent', 'markdown', 'text'].includes(k)
    );
    
    console.log(contentFields.length > 0 ? contentFields : 'No standard content fields found');
    console.log('');
    
    console.log('🔎 Checking each potential content field:');
    console.log(`  richContent: ${typeof post.richContent === 'object' ? '✅ Object' : typeof post.richContent}`);
    console.log(`  content: ${typeof post.content === 'object' ? '✅ Object' : typeof post.content}`);
    console.log(`  htmlBody: ${typeof post.htmlBody === 'string' ? `✅ String (${post.htmlBody?.substring(0, 50)}...)` : typeof post.htmlBody}`);
    console.log(`  plainContent: ${typeof post.plainContent === 'string' ? `✅ String (${post.plainContent?.substring(0, 50)}...)` : typeof post.plainContent}`);
    console.log(`  body: ${typeof post.body == null ? 'undefined' : typeof post.body}`);
    console.log('');
    
    // If richContent exists, show its structure
    if (post.richContent) {
      console.log('📦 RichContent structure:');
      console.log(`  Type: ${typeof post.richContent}`);
      console.log(`  Keys: ${Object.keys(post.richContent).slice(0, 10).join(', ')}`);
      if (post.richContent.nodes) {
        console.log(`  Has nodes: ${post.richContent.nodes.length} items`);
      }
    } else {
      console.log('⚠️  richContent field is missing or undefined');
    }
    
    console.log('\n✨ Test complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testWixContentFields();
