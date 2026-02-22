const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;

async function checkDataStore() {
  try {
    const auth = new GoogleAuth({
      keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const url = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATA_STORE_ID}`;
    
    const response = await axios.get(url, {
      headers: { 
        'Authorization': `Bearer ${token.token}`,
        'X-Goog-User-Project': PROJECT_ID,
      }
    });

    console.log('📊 Data Store Configuration:\n');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkDataStore();
