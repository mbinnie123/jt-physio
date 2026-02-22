#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_AUTHOR_MEMBER_ID = process.env.WIX_AUTHOR_MEMBER_ID;

if (!WIX_API_KEY || !WIX_SITE_ID || !WIX_AUTHOR_MEMBER_ID) {
  console.error('Missing WIX_API_KEY, WIX_SITE_ID, or WIX_AUTHOR_MEMBER_ID');
  process.exit(1);
}

const wixHeaders = {
  'Authorization': WIX_API_KEY,
  'wix-site-id': WIX_SITE_ID,
  'Content-Type': 'application/json'
};

async function testDifferentMediaFields() {
  console.log('\n📡 Testing different media field approaches...\n');
  
  const testImageUrl = 'https://storage.googleapis.com/image-gen-jt/blog-images/test-image.png';
  
  const approaches = [
    {
      name: 'Approach 1: coverMedia.image.url (current)',
      payload: {
        title: `Test - coverMedia - ${Date.now()}`,
        authorId: WIX_AUTHOR_MEMBER_ID,
        richContent: {
          nodes: [{type: 'paragraph', nodes: [{type: 'text', text: 'Test content'}]}]
        },
        coverMedia: {
          image: { url: testImageUrl }
        }
      }
    },
    {
      name: 'Approach 2: media.wixMedia',
      payload: {
        title: `Test - wixMedia - ${Date.now()}`,
        authorId: WIX_AUTHOR_MEMBER_ID,
        richContent: {
          nodes: [{type: 'paragraph', nodes: [{type: 'text', text: 'Test content'}]}]
        },
        media: {
          wixMedia: {
            image: {
              url: testImageUrl,
              filename: 'test.png'
            }
          }
        }
      }
    },
    {
      name: 'Approach 3: featuredImage',
      payload: {
        title: `Test - featuredImage - ${Date.now()}`,
        authorId: WIX_AUTHOR_MEMBER_ID,
        richContent: {
          nodes: [{type: 'paragraph', nodes: [{type: 'text', text: 'Test content'}]}]
        },
        featuredImage: testImageUrl
      }
    },
    {
      name: 'Approach 4: featureImage',
      payload: {
        title: `Test - featureImage - ${Date.now()}`,
        authorId: WIX_AUTHOR_MEMBER_ID,
        richContent: {
          nodes: [{type: 'paragraph', nodes: [{type: 'text', text: 'Test content'}]}]
        },
        featureImage: testImageUrl
      }
    }
  ];

  for (const approach of approaches) {
    console.log(`\n🔍 ${approach.name}`);
    console.log('---');
    
    try {
      const response = await axios.post(
        'https://www.wixapis.com/blog/v3/draft-posts',
        { draftPost: approach.payload },
        { headers: wixHeaders, timeout: 10000 }
      );

      const draft = response.data?.draftPost;
      if (draft) {
        console.log(`✓ Draft created: ${draft.id}`);
        console.log(`  Title: ${draft.title}`);
        console.log(`  Media structure:`, draft.media ? JSON.stringify(draft.media, null, 2) : '(no media field)');
        console.log(`  Fields in payload that made it through:`, Object.keys(draft).filter(k => k.includes('media') || k.includes('cover') || k.includes('feature')));
      }
    } catch (error) {
      console.error(`✗ Error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data) {
        console.error('  Full error:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

testDifferentMediaFields();
