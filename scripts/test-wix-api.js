#!/usr/bin/env node

/**
 * Test Wix API connectivity and identify issues
 * Usage: node scripts/test-wix-api.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = rest.join('=').trim();
  }
});

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_ACCOUNT_ID = process.env.WIX_ACCOUNT_ID;

if (!WIX_API_KEY) {
  console.error('❌ Error: WIX_API_KEY not set in .env.local');
  process.exit(1);
}

if (!WIX_SITE_ID) {
  console.error('❌ Error: WIX_SITE_ID not set in .env.local');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://www.wixapis.com/v1',
  headers: {
    Authorization: WIX_API_KEY,
    'Content-Type': 'application/json',
    'wix-account-id': WIX_ACCOUNT_ID,
  },
});

async function test() {
  console.log('\n🔍 Testing Wix API Connection\n');
  console.log(`API Key (first 20 chars): ${WIX_API_KEY.substring(0, 20)}...`);
  console.log(`Site ID: ${WIX_SITE_ID}\n`);

  // Test 1: Generic API call
  console.log('1️⃣  Testing generic Wix API endpoint (/contacts)...');
  try {
    const response = await client.get('/contacts/contacts', {
      params: { limit: 1 },
    });
    console.log(`   ✅ Success (Status: ${response.status})`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`   ❌ Failed (Status: ${error.response?.status})`);
      console.log(`   Error: ${error.response?.statusText}`);
      console.log(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
  }

  // Test 2: Blog endpoint
  console.log('\n2️⃣  Testing Blog endpoint (/blogs/posts)...');
  try {
    const response = await client.get('/blogs/posts', {
      params: { limit: 1 },
    });
    console.log(`   ✅ Success (Status: ${response.status})`);
    console.log(`   Blog feature IS available on your site`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      console.log(`   ❌ Failed (Status: ${status})`);
      console.log(`   Error: ${error.response?.statusText}`);
      
      if (status === 404) {
        console.log('\n   🚨 404 Error indicates one of the following:');
        console.log('      a) Blog app is NOT installed on your Wix site');
        console.log('      b) Wrong site ID (WIX_SITE_ID)');
        console.log('      c) API key doesn\'t have blog permissions');
        console.log('\n   ✨ To fix: Add Blog app to your Wix site');
        console.log('      → Open Wix Editor');
        console.log('      → Click "Add"');
        console.log('      → Search for "Blog"');
        console.log('      → Click "Add" to install');
      }
    }
  }

  // Test 3: Try to publish a test post
  console.log('\n3️⃣  Testing blog post creation (test post)...');
  try {
    const testPost = {
      post: {
        title: 'Test Post - Delete Me',
        slug: 'test-post-' + Date.now(),
        content: JSON.stringify({
          version: 1,
          nodes: [{
            type: 'paragraph',
            key: 'abc123',
            nodes: [{
              type: 'text',
              textData: { text: 'This is a test post' }
            }]
          }]
        }),
        excerpt: 'Test post excerpt',
        authorId: process.env.WIX_AUTHOR_MEMBER_ID || '',
        published: true,
        publishedDate: new Date().toISOString(),
      }
    };

    const response = await client.post('/blogs/posts', testPost);
    console.log(`   ✅ Success! Post created with ID: ${response.data.id}`);
    console.log(`   📝 Test post slug: ${testPost.post.slug}`);
    console.log(`   ⚠️  Please delete this test post from your Wix dashboard`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`   ❌ Failed (Status: ${error.response?.status})`);
      console.log(`   Error: ${error.response?.statusText}`);
      console.log(`   Details: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
  }

  console.log('\n✨ Test complete!\n');
}

test().catch(console.error);
