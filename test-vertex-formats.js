#!/usr/bin/env node

/**
 * Test Valid Document Fields for Vertex
 * 
 * Tries different field formats to find what works
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';

async function getAuthHeaders() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  return {
    'Authorization': `Bearer ${token.token}`,
    'Content-Type': 'application/json',
  };
}

async function testFormats() {
  try {
    console.log('🧪 Testing Valid Vertex Document Formats\n');

    const headers = await getAuthHeaders();
    const baseUrl = 'https://discoveryengine.googleapis.com';
    const endpoint = `${baseUrl}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import`;

    // Test formats
    const formats = [
      {
        name: 'Format 1: Only id and htmlContent',
        doc: {
          id: 'test-format-1',
          htmlContent: '<h1>Test</h1><p>This is test content</p>'
        }
      },
      {
        name: 'Format 2: id with empty structData',
        doc: {
          id: 'test-format-2',
          structData: {}
        }
      },
      {
        name: 'Format 3: id, htmlContent, and structData with metadata',
        doc: {
          id: 'test-format-3',
          htmlContent: '<h1>Test Title</h1><p>Test content here</p>',
          structData: {
            source: 'test-source'
          }
        }
      },
      {
        name: 'Format 4: id with jsonContent',
        doc: {
          id: 'test-format-4',
          jsonContent: JSON.stringify({ content: 'test content' })
        }
      },
      {
        name: 'Format 5: plainText content',
        doc: {
          id: 'test-format-5',
          plainText: 'This is plain text content'
        }
      }
    ];

    for (const { name, doc } of formats) {
      try {
        console.log(`\n🔍 Testing: ${name}`);
        console.log(`   Fields: ${Object.keys(doc).join(', ')}`);

        const payload = {
          inlineSource: {
            documents: [doc]
          }
        };

        const response = await axios.post(endpoint, payload, { headers });
        console.log(`   ✅ SUCCESS - Format works!`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.log(`   ❌ Failed: ${errorMsg.substring(0, 80)}`);
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n💡 Based on the test results above, use the working format in chunk script');

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testFormats();
