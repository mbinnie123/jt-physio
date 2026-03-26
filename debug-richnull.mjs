#!/usr/bin/env node

// Test the Next.js backend endpoint to debug what Wix returns
import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function testBackendEndpoint() {
  try {
    console.log('🔍 Fetching published posts from backend...');
    
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

    // Get detail of first post
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
    
    console.log('🔍 Detailed richContent analysis:');
    console.log(`  richContent value: ${JSON.stringify(post.richContent)}`);
    console.log(`  richContent type: ${typeof post.richContent}`);
    console.log(`  richContent keys: ${post.richContent ? Object.keys(post.richContent) : 'null'}`);
    
    if (post.richContent === null) {
      console.log('⚠️  richContent is explicitly null');
      console.log('\n🔎 Checking for alternative content fields:');
      
      // Check raw value of other fields
      console.log(`  htmlBody: ${typeof post.htmlBody} = ${post.htmlBody ? `"${post.htmlBody.substring(0, 50)}..."` : 'null'}`);
      console.log(`  plainContent: ${typeof post.plainContent} = ${post.plainContent ? `"${post.plainContent.substring(0, 50)}..."` : 'null'}`);
      console.log(`  content: ${typeof post.content} = ${post.content ? `"${JSON.stringify(post.content).substring(0, 50)}..."` : 'null'}`);
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
