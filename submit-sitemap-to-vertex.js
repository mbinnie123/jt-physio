#!/usr/bin/env node

/**
 * Submit sitemap to Vertex AI Search via official API
 * 
 * This script submits your sitemap to Vertex AI Search's siteSearchEngine
 * instead of importing individual URLs as documents. Vertex will crawl and
 * index the pages automatically.
 * 
 * Usage:
 *   node submit-sitemap-to-vertex.js https://example.com/shoulder-urls-sitemap.xml
 *   node submit-sitemap-to-vertex.js  # Uses localhost for local testing
 */

const fs = require('fs');
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

async function submitSitemap(sitemapUri) {
  try {
    console.log('\n📋 Submitting sitemap to Vertex AI Search...');
    console.log(`   Project: ${PROJECT_ID}`);
    console.log(`   Data Store: ${DATA_STORE_ID}`);
    console.log(`   Location: ${LOCATION}`);
    console.log(`   Sitemap URI: ${sitemapUri}\n`);

    const token = await getAccessToken();

    // Construct the endpoint
    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/siteSearchEngine/sitemaps`;

    const params = new URLSearchParams({
      'sitemap.uri': sitemapUri,
    });

    const fullUrl = `${endpoint}?${params.toString()}`;

    console.log(`🔗 API Endpoint: ${endpoint}`);
    console.log(`📍 Query Parameter: sitemap.uri=${sitemapUri}\n`);

    const response = await axios.post(
      fullUrl,
      {}, // Empty body for sitemap submission
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Goog-User-Project': PROJECT_ID,
        },
        maxRedirects: 5,
      }
    );

    console.log('✅ Sitemap submitted successfully!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n⏱️  Vertex will now:');
    console.log('   1. Crawl the pages listed in your sitemap');
    console.log('   2. Index the content (takes a few hours on average)');
    console.log('   3. Daily refresh any updated/added/deleted URLs');
    console.log('   4. Refresh unchanged URLs every 14 days');

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.error?.message || error.message}`);
      console.error('\n📝 Full Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ Network Error: Could not reach the Vertex API');
      console.error('   Make sure you have internet connection and the API is enabled');
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

async function listSitemaps() {
  try {
    console.log('\n📋 Checking sitemaps already in data store...\n');

    const token = await getAccessToken();

    const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/siteSearchEngine/sitemaps:fetch`;

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Goog-User-Project': PROJECT_ID,
      },
    });

    if (response.data.sitemaps && response.data.sitemaps.length > 0) {
      console.log('📊 Existing sitemaps in data store:');
      response.data.sitemaps.forEach((sitemap, index) => {
        console.log(`\n${index + 1}. ${sitemap.uri || sitemap.displayName || 'Unknown'}`);
        if (sitemap.createTime) {
          console.log(`   Created: ${sitemap.createTime}`);
        }
      });
    } else {
      console.log('No sitemaps currently in data store');
    }
  } catch (error) {
    console.error('⚠️  Could not list existing sitemaps:', error.message);
  }
}

async function main() {
  try {
    // Validate environment variables
    if (!PROJECT_ID || !DATA_STORE_ID) {
      console.error('❌ Missing required environment variables:');
      if (!PROJECT_ID) console.error('   - GCP_PROJECT_ID');
      if (!DATA_STORE_ID) console.error('   - VERTEX_DATA_STORE_ID');
      process.exit(1);
    }

    // Get sitemap URI from command line argument
    let sitemapUri = process.argv[2];

    if (!sitemapUri) {
      // Default to localhost for development
      sitemapUri = 'http://localhost:3000/shoulder-urls-sitemap.xml';
      console.log('⚠️  No sitemap URI provided. Using default:');
      console.log(`   ${sitemapUri}\n`);
      console.log('💡 For production, submit with:');
      console.log('   node submit-sitemap-to-vertex.js https://yourdomain.com/shoulder-urls-sitemap.xml\n');
    }

    // List existing sitemaps
    await listSitemaps();

    // Submit new sitemap
    await submitSitemap(sitemapUri);
  } catch (error) {
    process.exit(1);
  }
}

main();
