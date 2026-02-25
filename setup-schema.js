#!/usr/bin/env node

/**
 * Setup Vertex Data Store Schema
 * 
 * Adds the required fields for shoulder exercise documentation:
 * - title (searchable, retrievable)
 * - url (retrievable)
 * - source (retrievable)
 * - excerpt (searchable, retrievable)
 * - keywords (searchable, repeatable)
 * 
 * Usage:
 *   node setup-schema.js
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

async function setupSchema() {
  try {
    console.log('🔧 Setting up Vertex Data Store Schema...\n');

    const token = await getAccessToken();
    const schemaEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/schemas/default_schema`;

    // First get current schema
    console.log('📥 Fetching current schema...');
    const getResponse = await axios.get(schemaEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const currentSchema = getResponse.data;
    console.log('✓ Schema retrieved\n');

    // Define the fields we need
    const fieldsToAdd = [
      {
        fieldName: 'title',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: true,
        indexable: true
      },
      {
        fieldName: 'url',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: false,
        indexable: false
      },
      {
        fieldName: 'source',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: true,
        indexable: true
      },
      {
        fieldName: 'excerpt',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: true,
        indexable: true
      },
      {
        fieldName: 'keywords',
        fieldType: 'STRING',
        isRepeatable: true,
        retrievable: true,
        searchable: true,
        indexable: true
      },
      {
        fieldName: 'chunkIndex',
        fieldType: 'INTEGER',
        isRepeatable: false,
        retrievable: true,
        searchable: false,
        indexable: false
      },
      {
        fieldName: 'totalChunks',
        fieldType: 'INTEGER',
        isRepeatable: false,
        retrievable: true,
        searchable: false,
        indexable: false
      },
      {
        fieldName: 'contentType',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: false,
        indexable: false
      },
      {
        fieldName: 'language',
        fieldType: 'STRING',
        isRepeatable: false,
        retrievable: true,
        searchable: false,
        indexable: false
      }
    ];

    // Initialize structSchema if needed
    if (!currentSchema.structSchema) {
      currentSchema.structSchema = { fieldConfigs: [] };
    }
    if (!currentSchema.structSchema.fieldConfigs) {
      currentSchema.structSchema.fieldConfigs = [];
    }

    // Get existing field names
    const existingFields = currentSchema.structSchema.fieldConfigs.map(f => f.fieldName);

    // Add only new fields
    console.log('📝 Adding fields to schema:\n');
    let fieldsAdded = 0;

    fieldsToAdd.forEach(field => {
      if (!existingFields.includes(field.fieldName)) {
        currentSchema.structSchema.fieldConfigs.push(field);
        console.log(`  ✓ ${field.fieldName} (${field.fieldType})`);
        fieldsAdded++;
      } else {
        console.log(`  - ${field.fieldName} (already exists)`);
      }
    });

    if (fieldsAdded === 0) {
      console.log('\nℹ️  All fields already exist in schema');
      return;
    }

    // Update schema using PUT instead of PATCH
    console.log(`\n📤 Updating schema on Vertex (adding ${fieldsAdded} fields)...`);

    const updatePayload = {
      structSchema: currentSchema.structSchema
    };

    const updateResponse = await axios.put(
      schemaEndpoint,
      currentSchema,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ Schema updated successfully!\n');
    console.log('═'.repeat(70));
    console.log('\n✨ Schema is now ready to accept documents!\n');
    console.log('📋 Next steps:\n');
    console.log('1. Regenerate and import chunks:');
    console.log('   node chunk-and-index-resources.js --gcs\n');
    console.log('2. Import from GCS:');
    console.log('   node import-from-gcs.js shoulder-chunks-*.ndjson\n');
    console.log('3. Check preview in Vertex console after indexing (2-4 hours)\n');
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

setupSchema();
