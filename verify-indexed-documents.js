#!/usr/bin/env node

/**
 * Verify what documents have been indexed in Vertex Data Store
 * Shows all imported documents and their indexing status
 */

const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';

async function getAccessToken() {
  try {
    const auth = new GoogleAuth({
      keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    throw error;
  }
}

async function listDocuments() {
  try {
    console.log('\n📋 Fetching indexed documents from Vertex Data Store...\n');

    const token = await getAccessToken();

    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/branches/default_branch/documents`;

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Goog-User-Project': PROJECT_ID,
      },
      params: {
        pageSize: 100,
      },
    });

    const documents = response.data.documents || [];

    if (documents.length === 0) {
      console.log('⚠️  No documents found in data store');
      console.log('   Indexing may still be in progress (10-30 minutes)');
      return;
    }

    console.log(`✅ Found ${documents.length} document(s) in data store\n`);
    console.log('='.repeat(70));

    documents.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1}`);
      console.log(`   ID: ${doc.id}`);
      
      if (doc.displayName) {
        console.log(`   Name: ${doc.displayName}`);
      }

      if (doc.structuredData) {
        const fields = doc.structuredData.json || doc.structuredData;
        
        if (typeof fields === 'string') {
          try {
            const parsed = JSON.parse(fields);
            if (parsed.title) console.log(`   Title: ${parsed.title}`);
            if (parsed.url) console.log(`   URL: ${parsed.url}`);
            if (parsed.content) console.log(`   Content: ${parsed.content.substring(0, 100)}...`);
          } catch (e) {
            console.log(`   Data: ${fields.substring(0, 100)}...`);
          }
        } else if (typeof fields === 'object') {
          if (fields.title) console.log(`   Title: ${fields.title}`);
          if (fields.url) console.log(`   URL: ${fields.url}`);
          if (fields.content) console.log(`   Content: ${fields.content.substring(0, 100)}...`);
        }
      }

      if (doc.jsonData) {
        try {
          const parsed = typeof doc.jsonData === 'string' ? JSON.parse(doc.jsonData) : doc.jsonData;
          if (parsed.title) console.log(`   Title: ${parsed.title}`);
          if (parsed.url) console.log(`   URL: ${parsed.url}`);
          if (parsed.content) console.log(`   Content: ${parsed.content.substring(0, 100)}...`);
        } catch (e) {
          console.log(`   JSON Data: ${doc.jsonData.substring(0, 80)}...`);
        }
      }

      if (doc.createTime) {
        const date = new Date(doc.createTime);
        console.log(`   Created: ${date.toLocaleString()}`);
      }

      if (doc.updateTime) {
        const date = new Date(doc.updateTime);
        console.log(`   Updated: ${date.toLocaleString()}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Documents: ${documents.length}`);
    
    // Check if there are more pages
    if (response.data.nextPageToken) {
      console.log(`   More documents available (pagination token exists)`);
    }

    console.log('\n⏱️  Timeline:');
    console.log('   1. Documents submitted: ✅');
    console.log('   2. Indexing in progress: (10-30 minutes)');
    console.log('   3. Available for search: ~2-4 hours');

  } catch (error) {
    if (error.response?.status === 403) {
      console.error('❌ Permission Denied');
      console.error('   Your service account may need additional roles');
    } else if (error.response?.status === 404) {
      console.error('❌ Data Store Not Found');
      console.error('   Check your VERTEX_DATA_STORE_ID');
    } else if (error.response) {
      console.error('❌ API Error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.error?.message || error.message}`);
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

async function main() {
  try {
    if (!PROJECT_ID || !DATA_STORE_ID) {
      console.error('❌ Missing required environment variables:');
      if (!PROJECT_ID) console.error('   - GCP_PROJECT_ID');
      if (!DATA_STORE_ID) console.error('   - VERTEX_DATA_STORE_ID');
      process.exit(1);
    }

    console.log(`🔍 Checking Data Store: ${DATA_STORE_ID}`);
    console.log(`📍 Project: ${PROJECT_ID}`);
    console.log(`🌍 Location: ${LOCATION}`);

    await listDocuments();
  } catch (error) {
    process.exit(1);
  }
}

main();
