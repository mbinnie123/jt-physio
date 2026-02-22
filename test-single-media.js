#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_AUTHOR_MEMBER_ID = process.env.WIX_AUTHOR_MEMBER_ID;

if (!WIX_API_KEY || !WIX_SITE_ID || !WIX_AUTHOR_MEMBER_ID) {
  console.error('Missing WIX variables');
  process.exit(1);
}

const wixHeaders = {
  'Authorization': WIX_API_KEY,
  'wix-site-id': WIX_SITE_ID,
  'Content-Type': 'application/json'
};

// Match the actual node structure we use in wix-publisher.ts
function createTextNode(text) {
  return {
    id: `text-${Date.now()}`,
    type: 'TEXT',
    nodes: [],
    textData: {
      text: text,
      decorations: []
    }
  };
}

function createParagraphNode(text) {
  return {
    id: `para-${Date.now()}`, 
    type: 'PARAGRAPH',
    nodes: [createTextNode(text)],
    paragraphData: {
      textStyle: { textAlignment: 'AUTO' }
    }
  };
}

async function test() {
  const testUrl = 'https://storage.googleapis.com/image-gen-jt/blog-images/test.png';
  
  const fieldNames = [
    'coverMedia',
    'featured_image',  
    'featuredImage',
    'featureImage',
    'coverImage',
    'media'
  ];

  for (const fieldName of fieldNames) {
    console.log(`\n📝 Testing field name: "${fieldName}"`);
    console.log('---');
    
    const basePayload = {
      title: `Test ${fieldName} - ${Date.now()}`,
      authorId: WIX_AUTHOR_MEMBER_ID,
      memberId: WIX_AUTHOR_MEMBER_ID,
      richContent: {
        nodes: [createParagraphNode(`Testing ${fieldName} field`)],
        metadata: { version: 1 },
        documentStyle: {}
      }
    };
    
    // Add the field we're testing
    if (fieldName === 'coverMedia') {
      basePayload.coverMedia = { image: { url: testUrl } };
    } else if (fieldName === 'media') {
      basePayload.media = { image: { url: testUrl } };
    } else {
      basePayload[fieldName] = testUrl;
    }
    
    try {
      const response = await axios.post(
        'https://www.wixapis.com/blog/v3/draft-posts',
        { draftPost: basePayload },
        { headers: wixHeaders, timeout: 5000 }
      );
      
      const draft = response.data?.draftPost;
      console.log(`✓ Draft created (ID: ${draft.id})`);
      console.log(`  Media field in response:`, JSON.stringify(draft?.media));
      
      // Check if our field was preserved
      if (fieldName !== 'coverMedia' && fieldName !== 'media') {
        console.log(`  Original "${fieldName}" in response:`, draft[fieldName] ? '✓ YES' : '✗ NO');
      }
    } catch (error) {
      console.log(`✗ Error: ${error.response?.status}`);
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes('Missing')) {
          console.log(`  Message: ${msg.split('\n')[0]}`);
        } else {
          console.log(`  Message: ${msg.substring(0, 60)}...`);
        }
      }
    }
  }
}

test();
