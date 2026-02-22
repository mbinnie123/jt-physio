#!/usr/bin/env node

/**
 * Import shoulder exercise URLs to Vertex Data Store
 * Uses Google Discovery Engine API
 */

const fs = require('fs');
const { google } = require('googleapis');
const csv = require('csv-parse');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'jt-physio-441316';
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID || 'blog-research-index_1771434940842';
const LOCATION = process.env.GCP_LOCATION || 'global';

async function importToVertex() {
  try {
    // Create service account auth
    const keyFile = './gcp-service-account.json';
    if (!fs.existsSync(keyFile)) {
      console.error('❌ gcp-service-account.json not found');
      process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    
    // Read CSV file
    const csvContent = fs.readFileSync('./shoulder-urls.csv', 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`📄 Found ${lines.length - 1} records in CSV (excluding header)\n`);

    // Parse CSV (skip header)
    const records = lines.slice(1).map(line => {
      const match = line.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
      if (match) {
        return {
          url: match[1],
          title: match[2],
          topic: match[3],
          content_type: match[4],
        };
      }
      return null;
    }).filter(Boolean);

    console.log('📋 Records to import:');
    records.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title}`);
      console.log(`      ${r.url}\n`);
    });

    // Use Discovery Engine API
    const discoveryEngine = google.discoveryengine('v1');
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}`;
    
    console.log(`🔗 Target: ${parent}\n`);
    
    // Create documents from records
    const documents = records.map((record, i) => ({
      id: `shoulder-url-${i + 1}`,
      structData: {
        title: record.title,
        url: record.url,
        topic: record.topic,
        content_type: record.content_type,
      },
    }));

    console.log('📤 Attempting to import documents...\n');

    // Import using BatchCreateDocuments endpoint
    const response = await discoveryEngine.projects.locations.dataStores.branches.documents.import(
      {
        parent: `${parent}/branches/default_branch`,
        requestBody: {
          inlineSource: {
            documents: documents.map(doc => ({
              id: doc.id,
              structData: doc.structData,
            })),
          },
        },
      },
      { auth: client }
    );

    console.log('✅ Import request submitted successfully!');
    console.log(`\nResponse:`, JSON.stringify(response.data, null, 2));
    
    console.log('\n⏳ Indexing may take 5-10 minutes.');
    console.log('Check your Vertex console: https://console.cloud.google.com/discovery-engine/\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data?.error?.message) {
      console.error('   Details:', error.response.data.error.message);
    }
    process.exit(1);
  }
}

importToVertex();
