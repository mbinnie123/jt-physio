#!/usr/bin/env node

/**
 * Import documents from GCS bucket to Vertex Data Store
 * 
 * Usage:
 *   node import-from-gcs.js
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';

const BUCKET_NAME = 'jt-physio-documents';

// Allow overriding the input file pattern without editing code
// Usage: node import-from-gcs.js shoulder-resources-*.jsonl
const INPUT_PATTERN = process.argv[2] || process.env.GCS_INPUT_PATTERN || 'shoulder-resources-*.jsonl';

// Where Discovery Engine should write per-record import errors (optional but very useful)
const ERROR_PREFIX = process.env.GCS_IMPORT_ERROR_PREFIX || `gs://${BUCKET_NAME}/import-errors/`;

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

async function importFromGCS(token) {
  try {
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import`;

    const payload = {
      gcsSource: {
        inputUris: [`gs://${BUCKET_NAME}/${INPUT_PATTERN}`]
      },
      errorConfig: {
        gcsPrefix: ERROR_PREFIX
      },
      reconciliationMode: "INCREMENTAL"
    };

    console.log('📤 Importing documents from GCS...');
    console.log(`   Bucket: gs://${BUCKET_NAME}/`);
    console.log(`   Pattern: ${INPUT_PATTERN}`);
    console.log(`   Error logs: ${ERROR_PREFIX}`);

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('\n✅ Import initiated successfully!');
    console.log(`   Operation: ${response.data.name}`);
    console.log('\n📋 Timeline:');
    console.log('   1. Documents queued for import: ✅');
    console.log('   2. Processing in background: 5-10 minutes');
    console.log('   3. Indexing: 10-30 minutes');
    console.log('   4. Available for search: ~2-4 hours');

    return response.data;
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔄 Importing from Google Cloud Storage\n');
  console.log(`📍 Project: ${PROJECT_ID}`);
  console.log(`📚 Data Store: ${DATA_STORE_ID}`);
  console.log(`🌍 Location: ${LOCATION}\n`);

  if (!PROJECT_ID || !DATA_STORE_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const token = await getAccessToken();
  await importFromGCS(token);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
