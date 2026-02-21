#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });

const axios = require('axios');

console.log(`
╔════════════════════════════════════════════════════════════╗
║      WIX AUTHOR MEMBER ID FINDER                          ║
╚════════════════════════════════════════════════════════════╝
`);

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.log('❌ Missing credentials in .env.local');
  console.log('   WIX_API_KEY:', WIX_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('   WIX_SITE_ID:', WIX_SITE_ID ? '✓ Set' : '✗ Missing');
  process.exit(1);
}

console.log('📋 Attempting to fetch member information...\n');

// Try to get current user/member information
const endpoints = [
  {
    name: 'Members List',
    method: 'GET',
    url: 'https://www.wixapis.com/v1/contacts/members',
    headers: {
      'Authorization': `Bearer ${WIX_API_KEY}`,
      'wix-site-id': WIX_SITE_ID
    }
  },
  {
    name: 'Site Members',
    method: 'GET',
    url: 'https://www.wixapis.com/v1/members',
    headers: {
      'Authorization': `Bearer ${WIX_API_KEY}`,
      'wix-site-id': WIX_SITE_ID
    }
  },
  {
    name: 'Current User',
    method: 'GET',
    url: 'https://www.wixapis.com/v1/members/me',
    headers: {
      'Authorization': `Bearer ${WIX_API_KEY}`,
      'wix-site-id': WIX_SITE_ID
    }
  }
];

let memberFound = false;

async function testEndpoint(endpoint) {
  try {
    console.log(`📡 Testing: ${endpoint.name}`);
    const response = await axios({
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      timeout: 5000
    });

    console.log(`✓ Success (${response.status})\n`);

    // Parse different response formats
    if (response.data.member) {
      // Single member response
      displayMember(response.data.member);
      memberFound = true;
    } else if (response.data.members && response.data.members.length > 0) {
      // Multiple members response
      console.log(`Found ${response.data.members.length} member(s):\n`);
      response.data.members.forEach((member, index) => {
        console.log(`Member ${index + 1}:`);
        displayMember(member);
        console.log('---\n');
      });
      memberFound = true;
    } else if (response.data.contacts && response.data.contacts.length > 0) {
      // Contacts response
      console.log(`Found ${response.data.contacts.length} contact(s):\n`);
      response.data.contacts.forEach((contact, index) => {
        console.log(`Contact ${index + 1}:`);
        displayContact(contact);
        console.log('---\n');
      });
      memberFound = true;
    } else {
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }

    return true;
  } catch (error) {
    const status = error.response?.status || 'Unknown';
    const message = error.response?.statusText || error.message;
    console.log(`✗ Failed (${status}: ${message})\n`);
    return false;
  }
}

function displayMember(member) {
  console.log(`  ID: ${member.id || 'N/A'}`);
  console.log(`  Email: ${member.email || member.loginEmail || 'N/A'}`);
  console.log(`  Name: ${member.name || member.firstName + ' ' + member.lastName || 'N/A'}`);
  console.log(`  Role: ${member.role || 'N/A'}`);
  console.log(`  Status: ${member.status || 'N/A'}`);
  
  if (member.id) {
    console.log(`\n  📌 USE THIS IN .env.local:`);
    console.log(`     WIX_AUTHOR_MEMBER_ID=${member.id}`);
  }
}

function displayContact(contact) {
  console.log(`  ID: ${contact.id || 'N/A'}`);
  console.log(`  Email: ${contact.primaryInfo?.email || 'N/A'}`);
  console.log(`  Name: ${contact.firstName} ${contact.lastName || ''}`);
  
  if (contact.id) {
    console.log(`\n  📌 USE THIS IN .env.local:`);
    console.log(`     WIX_AUTHOR_MEMBER_ID=${contact.id}`);
  }
}

// Test endpoints sequentially
(async () => {
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (memberFound) break;
  }

  if (!memberFound) {
    console.log(`
❌ Could not fetch member information

Possible reasons:
1. API key doesn't have members.read permission
2. API endpoints require different authentication
3. Wix API version mismatch

MANUAL SOLUTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://www.wix.com/dashboard
2. Settings → Account → Members
3. Find your name/email (the account owner)
4. Click on your name to see details
5. Copy the Member ID (UUID format)
6. Update .env.local:
   WIX_AUTHOR_MEMBER_ID=your-id-here

WHAT THE MEMBER ID LOOKS LIKE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UUID format: 12345678-1234-1234-1234-123456789012
Example:     ba6adc02-0b45-4780-84ba-dc1fde492045

If you already have it in .env.local, it's probably correct!
`);
  }
})();
