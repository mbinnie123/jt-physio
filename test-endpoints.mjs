#!/usr/bin/env node

import axios from 'axios';

const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjY3NWQ4ZDcyLWM4NzQtNDhmNS05OWRhLTYwNDYyMzVlMzZmYVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjQ0OWRiOWVhLTUzNGEtNGU2YS05NjE1LTVhYWY0NzA0ZWI5ZlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJiYTZhZGMwMi0wYjQ1LTQ3ODAtODRiYS1kYzFmZGU0OTIwNDVcIn19IiwiaWF0IjoxNzcxNjc5NzQ0fQ.ds-mCeAKH_xLli_ABpc3p8_c9ABdZ261ZuTKHA4oMTE7piGgnLgcTGsndcpVMHnHCav1JerP0jEYcBTu72NXBX2A4eZ8qKMLQkMMmupJ9M83wFRIsJ0XIdT5OGz81AkMgTgV0UQorCmCwn2YxhEfTP8ss-LV3EaqOOpge4zB3LhUy_XZ68CKfiEm91fE9sTizyD6jnOGvyQtyT-lIskCxoSWJJZFW3_6Vm8J2U9mVOYnUiOpr6d2lsnRxBVcefv-dB0E4ch7hrYX7frETxWHgTGfg4XYmrE3U8GFlP_bxerZAJAFDSU-Q7uZdsDBYHoxoFfp1XCvnge1b_sgUZoLOw';
const SITE_ID = 'a0398594-eaee-40bf-a70b-9287df970e8e';
const WIX_API_BASE = 'https://www.wixapis.com';

async function testEndpoints() {
  const endpoints = [
    '/blog/v3/drafts',
    '/blog/v3/posts/drafts', 
    '/cms/v1/items/blog-posts',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const response = await axios.get(`${WIX_API_BASE}${endpoint}`, {
        headers: {
          Authorization: API_KEY,
          'wix-site-id': SITE_ID,
        },
        params: { limit: 1 },
        timeout: 5000,
      });

      console.log(`  ✅ 200 OK`);
      console.log(`  Data keys: ${Object.keys(response.data).join(', ')}`);
      
      // Check first item structure
      const firstItemKey = Object.keys(response.data).find(k => Array.isArray(response.data[k]))?.[0];
      if (firstItemKey) {
        const item = response.data[firstItemKey][0];
        console.log(`  First item fields: ${Object.keys(item).slice(0, 10).join(', ')}`);
      }
    } catch (error) {
      const status = error.response?.status || 'unknown';
      console.log(`  ❌ ${status}`);
    }
  }
}

testEndpoints();
