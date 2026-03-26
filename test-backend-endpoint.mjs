#!/usr/bin/env node

// Test the Next.js backend endpoint to see what it returns
import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function testBackendEndpoint() {
  try {
    console.log('🔍 Fetching published posts from backend...');
    
    // First get list of posts
    const listResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });

    const posts = listResponse.data.posts || [];
    console.log(`✅ Found ${posts.length} posts\n`);
    
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    // Test detail fetch on first post
    const firstPost = posts[0];
    console.log(`📄 Testing detail fetch for: "${firstPost.title}"`);
    console.log(`   ID: ${firstPost.id}\n`);
    
    const detailResponse = await axios.get(`${backendUrl}?action=details&postId=${firstPost.id}`, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });

    const post = detailResponse.data.post;
    
    console.log('🔎 Checking content fields in response:');
    console.log(`  richContent: ${post.richContent ? '✅ Present' : '❌ Missing'}`);
    console.log(`  htmlBody: ${post.htmlBody ? '✅ Present' : '❌ Missing'}`);
    console.log(`  plainContent: ${post.plainContent ? '✅ Present' : '❌ Missing'}`);
    console.log('');
    
    // If richContent exists, show its structure
    if (post.richContent) {
      console.log('📦 RichContent structure:');
      console.log(`  Type: ${typeof post.richContent}`);
      if (post.richContent.nodes) {
        console.log(`  ✅ Has nodes array with ${post.richContent.nodes.length} items`);
      } else if (post.richContent.type === 'paragraph') {
        console.log(`  ✅ Is paragraph type`);
      }
      console.log(`  Keys: ${Object.keys(post.richContent).slice(0, 5).join(', ')}`);
    } else {
      console.log('⚠️  richContent field is missing');
    }
    
    console.log('\n✨ Test complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testBackendEndpoint();
