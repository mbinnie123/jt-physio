#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// Parse .env.local
const env = {};
fs.readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.substring(0, idx).trim();
    const v = line.substring(idx + 1).trim();
    if (k && !k.startsWith('#')) {
      env[k] = v;
    }
  }
});

console.log('📋 Configuration:');
console.log('  Account ID:', env.WIX_ACCOUNT_ID);
console.log('  Site ID:', env.WIX_SITE_ID);
console.log('  API Key (first 20 chars):', env.WIX_API_KEY?.substring(0, 20) + '...');

const client = axios.create({
  baseURL: 'https://www.wixapis.com/v1',
  headers: {
    'Authorization': env.WIX_API_KEY,
    'wix-account-id': env.WIX_ACCOUNT_ID,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true
});

(async () => {
  try {
    console.log('\n🧪 Testing /blogs/posts endpoint...');
    const res = await client.get('/blogs/posts?limit=1');
    console.log('Status:', res.status);
    
    if (res.status === 200 || res.status === 201) {
      console.log('✅ SUCCESS!');
      console.log('Response:', JSON.stringify(res.data, null, 2).substring(0, 200));
    } else {
      console.log('❌ Failed');
      console.log('Error:', res.data);
    }
  } catch (err) {
    console.log('Exception:', err.message);
  }
})();
