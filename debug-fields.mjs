#!/usr/bin/env node

// Test the Next.js backend endpoint to see what fields are actually returned
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
    
    console.log('📋 ALL fields in response:');
    const fields = Object.keys(post).sort();
    fields.forEach(field => {
      const value = post[field];
      const valueType = typeof value;
      if (field === 'richContent' || field === 'content' || field === 'htmlBody' || field === 'plainContent') {
        console.log(`  ${field}: ${valueType} ${value ? '✅' : '❌'}`);
      } else if (valueType === 'string') {
        const preview = value.substring(0, 40).replace(/\n/g, ' ');
        console.log(`  ${field}: ${preview}...` + (value.length > 40 ? '' : ''));
      } else if (valueType === 'object') {
        console.log(`  ${field}: Object with keys [${Object.keys(value || {}).slice(0, 3).join(', ')}]`);
      } else {
        console.log(`  ${field}: ${value}`);
      }
    });
    
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
