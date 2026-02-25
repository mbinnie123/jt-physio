#!/usr/bin/env node

/**
 * Configure Data Store Content Setting to NO_CONTENT
 * 
 * Allows documents without content field (metadata-only documents)
 * 
 * Usage:
 *   node configure-content-setting.js
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function configureContentSetting() {
  try {
    console.log('🔧 Configuring Data Store Content Setting...\n');

    const token = await getAccessToken();
    
    // The endpoint to update data store settings
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}`;

    console.log('📥 Fetching current data store configuration...');
    const getResponse = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const dataStore = getResponse.data;
    console.log('✓ Configuration retrieved\n');

    // Check current content config
    const currentConfig = dataStore.contentConfig || 'CONTENT_TYPE_UNSPECIFIED';
    console.log(`Current content configuration: ${currentConfig}`);
    
    if (currentConfig === 'NO_CONTENT') {
      console.log('✅ Data store is already set to NO_CONTENT');
      return;
    }

    console.log('\n📤 Updating to NO_CONTENT...');

    const updatePayload = {
      ...dataStore,
      contentConfig: 'NO_CONTENT'
    };

    const updateResponse = await axios.patch(
      endpoint,
      updatePayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          'updateMask': 'contentConfig'
        }
      }
    );

    console.log('✅ Data store updated successfully!\n');
    console.log('═'.repeat(70));
    console.log('\n✨ Content configuration set to NO_CONTENT\n');
    console.log('📋 Next steps:\n');
    console.log('1. Re-import chunks:');
    console.log('   node import-from-gcs.js shoulder-chunks-1771891782401.ndjson\n');
    console.log('2. Wait for indexing (2-4 hours)\n');
    console.log('3. Test search in Vertex console\n');
    console.log('═'.repeat(70));

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('❌ Error:', errorMsg);
    
    if (error.response?.status === 403) {
      console.error('\n⚠️  Permission denied. Verify your service account has:');
      console.error('   roles/discoveryengine.editor');
    }
    
    process.exit(1);
  }
}

configureContentSetting();
