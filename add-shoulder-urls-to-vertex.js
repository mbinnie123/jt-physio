#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const urls = [
  {
    url: 'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
    title: 'NHS AAA - Shoulder Exercises for Weak and Painful MSK'
  },
  {
    url: 'https://bess.ac.uk/exercises-for-shoulder-pain/',
    title: 'BESS - Exercises for Shoulder Pain'
  },
  {
    url: 'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
    title: 'Surrey Physio - Top 5 Jo Gibson Shoulder Exercises'
  },
  {
    url: 'https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes',
    title: 'Cirencester Physiotherapy Centre - Shoulder Exercises for Athletes'
  }
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
    
    for (const { url, title } of urls) {
      try {
        console.log(`Adding: ${title}`);
        console.log(`URL: ${url}`);
        
        // Create a document in the data store that references the URL
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const createDocEndpoint = `https://discoveryengine.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/dataStores/${VERTEX_DATA_STORE_ID}/documents`;
        
        const docPayload = {
          document: {
            id: documentId,
            schemaId: 'default_schema',
            structData: {
              title: title,
              url: url,
              content: `Link to resource: ${title}`,
            },
          },
        };

        const response = await axios.post(
          createDocEndpoint,
          docPayload,
          { headers }
        );

        console.log(`✓ Added successfully (ID: ${documentId})\n`);
      } catch (error) {
        console.error(`✗ Failed to add ${title}`);
        console.error('Error:', error.response?.data?.error?.message || error.message);
        console.log('');
      }
    }

    console.log('✅ URL addition process complete!');
    console.log('\nNote: Indexing may take a few minutes. Check Vertex Discovery Engine console for status.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

addUrlsToVertexIndex();
