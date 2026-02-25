#!/usr/bin/env node

/**
 * Check and Display Vertex Data Store Schema
 * 
 * Shows exactly what fields your data store expects,
 * and helps you understand what format documents need
 * 
 * Usage:
 *   node check-schema.js
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

async function checkSchema() {
  try {
    console.log('🔍 Checking Data Store Schema...\n');
    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Data Store: ${DATA_STORE_ID}`);
    console.log(`Location: ${LOCATION}\n`);

    const token = await getAccessToken();
    const schemaEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/schemas/default_schema`;

    console.log('📥 Fetching schema...\n');
    const response = await axios.get(schemaEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const schema = response.data;

    // Display text schema if available
    if (schema.name) {
      console.log(`📌 Schema Name: ${schema.name}\n`);
    }

    // Display struct schema fields
    if (schema.structSchema?.fieldConfigs && schema.structSchema.fieldConfigs.length > 0) {
      console.log('📋 STRUCTURED FIELDS:\n');
      console.log('═'.repeat(80));
      
      schema.structSchema.fieldConfigs.forEach((field, i) => {
        console.log(`\n${i + 1}. ${field.fieldName}`);
        console.log(`   Type: ${field.fieldType}`);
        console.log(`   Repeatable: ${field.isRepeatable || false}`);
        console.log(`   Retrievable: ${field.retrievable || false}`);
        console.log(`   Searchable: ${field.searchable || false}`);
        console.log(`   Indexable: ${field.indexable || false}`);
        if (field.dynamicFacetableConfig) {
          console.log(`   Facetable: true`);
        }
      });
      
      console.log('\n' + '═'.repeat(80));
      console.log(`\nTotal fields: ${schema.structSchema.fieldConfigs.length}`);
    } else {
      console.log('⚠️  No structured fields defined in schema');
    }

    // Show content config
    console.log('\n📝 CONTENT CONFIGURATION:');
    console.log('═'.repeat(80));
    if (schema.contentConfig) {
      console.log(`Content Type: ${schema.contentConfig}`);
    } else {
      console.log('Content Type: Not specified (likely CONTENT_TYPE_UNSPECIFIED)');
    }

    // Show what you need to do
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 HOW TO STRUCTURE YOUR DOCUMENTS:\n');
    
    console.log('Your document should look like:');
    console.log('```json');
    console.log('{');
    console.log('  "id": "chunk-12345-0",');
    console.log('  "rawText": "The actual content text here...",');
    console.log('  "structData": {');

    // Show which fields are available
    const fieldNames = schema.structSchema?.fieldConfigs?.map(f => f.fieldName) || [];
    if (fieldNames.length > 0) {
      fieldNames.forEach((name, i) => {
        const isLast = i === fieldNames.length - 1;
        console.log(`    "${name}": "value"${isLast ? '' : ','}`);
      });
    } else {
      console.log('    // Add your custom fields here');
    }

    console.log('  }');
    console.log('}');
    console.log('```\n');

    if (fieldNames.length === 0) {
      console.log('⚠️  No fields are currently defined in your schema!');
      console.log('\n✨ RECOMMENDED NEXT STEPS:\n');
      console.log('1. Add required fields to your schema using the schema editor:');
      console.log('   https://console.cloud.google.com/vertex-ai');
      console.log('   - Go to Agent Builder > Data stores > Your data store > Schema');
      console.log('   - Add these fields:');
      console.log('     * title (STRING, searchable, retrievable)');
      console.log('     * url (STRING, retrievable)');
      console.log('     * source (STRING, retrievable)');
      console.log('     * excerpt (STRING, searchable, retrievable)');
      console.log('     * keywords (STRING, repeatable, searchable)');
      console.log('\n2. Or use the schema builder script (coming soon)');
    } else {
      console.log('✅ Fields are defined. Make sure your documents include these fields in structData');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    process.exit(1);
  }
}

checkSchema();
