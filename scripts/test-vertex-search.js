require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

async function run() {
  const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID } = process.env;
  if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_DATA_STORE_ID) {
    throw new Error('Missing Vertex env vars. Check .env.local');
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token || !token.token) {
    throw new Error('Failed to obtain Vertex access token');
  }

  const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/dataStores/${VERTEX_DATA_STORE_ID}/servingConfigs/default_search:search`;
  const { data } = await axios.post(
    endpoint,
    { query: 'physiotherapy', pageSize: 5 },
    { headers: { Authorization: `Bearer ${token.token}` } }
  );

  const simplified = (data.results || []).map((result) => ({
    title:
      result.document?.structData?.title ||
      result.document?.derivedStructData?.title ||
      result.document?.id,
    url:
      result.document?.structData?.url ||
      result.document?.derivedStructData?.url ||
      result.document?.uri,
  }));

  console.log(JSON.stringify(simplified, null, 2));
}

run().catch((error) => {
  console.error('Vertex search test failed:', error.response?.data || error.message || error);
  process.exit(1);
});
