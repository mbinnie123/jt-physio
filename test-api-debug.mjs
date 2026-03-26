#!/usr/bin/env node

import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function test() {
  try {
    // Get list first
    const listResponse = await axios.get(backendUrl, {
      headers: { Authorization: adminPassword },
      timeout: 15000,
    });

    const postId = listResponse.data.posts?.[0]?.id;
    if (!postId) {
      console.log('No posts found');
      return;
    }

    // Get detail with full logging
    console.log('Fetching detail endpoint...\n');
    const detailUrl = `${backendUrl}?action=details&postId=${postId}`;
    console.log(`URL: ${detailUrl}\n`);

    const detailResponse = await axios.get(detailUrl, {
      headers: { Authorization: adminPassword },
      timeout: 15000,
    });

    console.log('Response keys:', Object.keys(detailResponse.data));
    console.log('Post keys:', Object.keys(detailResponse.data.post).sort());
    console.log('\nFull response:');
    console.log(JSON.stringify(detailResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
