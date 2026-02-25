#!/usr/bin/env node

/**
 * Add the 'excerpt' field to Vertex Data Store schema
 * 
 * Usage:
 *   node add-excerpt-field.js
 */

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
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

async function addExcerptField(token) {
  try {
    // First, get the current schema
    const getEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/schemas/default_schema`;

    console.log('📥 Fetching current schema...');
    const getResponse = await axios.get(getEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const currentSchema = getResponse.data;
    console.log('✅ Current schema retrieved');

    // Check if excerpt field already exists
    if (currentSchema.structSchema?.fieldConfigs?.some(f => f.fieldName === 'excerpt')) {
      console.log('ℹ️  excerpt field already exists in schema');
      return;
    }

    // Add the excerpt field
    if (!currentSchema.structSchema) {
      currentSchema.structSchema = { fieldConfigs: [] };
    }
    if (!currentSchema.structSchema.fieldConfigs) {
      currentSchema.structSchema.fieldConfigs = [];
    }

    const excerptField = {
      fieldName: 'excerpt',
      fieldType: 'STRING',
      isRepeatable: true,
      retrievable: true,
      searchable: true
    };

    currentSchema.structSchema.fieldConfigs.push(excerptField);

    console.log('📤 Updating schema with excerpt field...');
    // Use updateMask in the query string in the correct format
    const updateEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/schemas/default_schema`;

    const patchPayload = {
      structSchema: currentSchema.structSchema
    };

    // Add updateMask as a query parameter
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: {
        'updateMask': 'structSchema.fieldConfigs'
      }
    };

    const updateResponse = await axios.patch(updateEndpoint, patchPayload, config);

    console.log('✅ Schema updated successfully!');
    console.log('   Field added: excerpt (STRING, repeatable, retrievable, searchable)');
    console.log('\n📋 Next steps:');
    console.log('   1. Re-import documents: node import-from-gcs.js "shoulder-resources-latest.jsonl"');
    console.log('   2. Documents will be indexed with excerpt field');
    console.log('   3. Excerpt will appear in search results');

    return updateResponse.data;
  } catch (error) {
    console.error('❌ Failed to update schema:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

async function main() {
  console.log('🔄 Adding excerpt field to Vertex schema\n');
  console.log(`📍 Project: ${PROJECT_ID}`);
  console.log(`📚 Data Store: ${DATA_STORE_ID}`);
  console.log(`🌍 Location: ${LOCATION}\n`);

  if (!PROJECT_ID || !DATA_STORE_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const token = await getAccessToken();
  await addExcerptField(token);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
