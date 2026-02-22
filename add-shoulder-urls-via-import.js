#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const urls = [
  'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
  'https://bess.ac.uk/exercises-for-shoulder-pain/',
  'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
  'https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes'
];

async function addUrlsToVertexIndex() {
  try {
    const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID } = process.env;
    
    if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_DATA_STORE_ID) {
      throw new Error('Missing required env vars: GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID');
    }

    console.log('🔐 Authenticating with Google Cloud...');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token || !token.token) {
      throw new Error('Failed to obtain Vertex access token');
    }

    const headers = {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📝 Adding URLs to Vertex Data Store...\n');
    
    // Try using the sitemap or bulk operation endpoint
    for (const url of urls) {
      try {
        console.log(`Adding: ${url}`);
        
        // Try the importDocuments endpoint with URL reference
        const importEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/dataStores/${VERTEX_DATA_STORE_ID}/importDocuments`;
        
        const payload = {
          inline_source: {
            documents: [
              {
                id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                struct_data: {
                  uri: url,
                  title: url.split('/').filter(Boolean).pop(),
                },
              }
            ]
          }
        };

        const response = await axios.post(
          importEndpoint,
          payload,
          { headers }
        );

        console.log(`✓ Added successfully\n`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.error(`✗ Endpoint not found (404). This may require manual import or a different API.`);
        } else {
          console.error(`✗ Error: ${error.response?.data?.error?.message || error.message}`);
        }
        console.log('');
      }
    }

    console.log('✅ Process complete!');
    console.log('\n📋 If the API endpoints above don\'t work, you may need to:');
    console.log('   1. Add these URLs via the Vertex AI console (UI)');
    console.log('   2. Use the web crawler feature in Discovery Engine');
    console.log('   3. Upload a sitemap.xml file with these URLs');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUrlsToVertexIndex();
