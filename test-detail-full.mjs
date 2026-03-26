#!/usr/bin/env node

import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function testDetailEndpoint() {
  try {
    console.log('🔍 Fetching published posts list...\n');
    
    const listResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });

    const posts = listResponse.data.posts || [];
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    const firstPost = posts[0];
    console.log(`🔍 Fetching full detail for: "${firstPost.title}"\n`);
    
    const detailResponse = await axios.get(`${backendUrl}?action=details&postId=${firstPost.id}`, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });

    console.log('📊 Full response:');
    console.log(JSON.stringify(detailResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testDetailEndpoint();
