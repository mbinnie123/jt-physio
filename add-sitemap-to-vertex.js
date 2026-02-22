#!/usr/bin/env node

/**
 * Import sitemap URLs to Vertex Data Store
 * Usage:
 *   node add-sitemap-to-vertex.js
 *   node add-sitemap-to-vertex.js --batch --size 5 --delay 500
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

// Parse CLI arguments
const args = process.argv.slice(2);
const useBatch = args.includes('--batch');
const batchSizeIdx = args.indexOf('--size');
const batchSize = batchSizeIdx > -1 ? parseInt(args[batchSizeIdx + 1]) : 5;
const delayIdx = args.indexOf('--delay');
const delayMs = delayIdx > -1 ? parseInt(args[delayIdx + 1]) : 500;

// Find sitemap path (exclude flag-related arguments)
const sitemapPath = args.find((arg, idx) => {
  if (arg.startsWith('--')) return false;
  const prevArg = args[idx - 1];
  return !prevArg || (!prevArg.endsWith('--size') && !prevArg.endsWith('--delay'));
}) || 'shoulder-urls-sitemap.xml';

/**
 * Parse sitemap XML and extract URLs
 */
function parseSitemapUrls(filePath) {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const urls = [];
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    let match;

    while ((match = urlRegex.exec(xmlContent)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  } catch (error) {
    console.error(`❌ Error reading sitemap at ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Get Vertex authentication headers
 */
async function getVertexAuthHeaders() {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    if (!token || !token.token) {
      throw new Error('Failed to obtain access token');
    }

    return {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    process.exit(1);
  }
}

/**
 * Add a single URL to Vertex
 */
async function addUrlToVertex(url, projectId, location, dataStoreId, headers) {
  try {
    const documentId = `shoulder-url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Use regional API endpoint if location is regional (not global)
    const baseUrl = location === 'global' 
      ? 'https://discoveryengine.googleapis.com'
      : `https://${location}-discoveryengine.googleapis.com`;
    
    const endpoint = `${baseUrl}/v1/projects/${projectId}/locations/${location}/dataStores/${dataStoreId}/branches/default_branch/documents:import`;

    const payload = {
      inlineSource: {
        documents: [
          {
            id: documentId,
            structData: {
              title: new URL(url).hostname,
              url: url,
              content: `Resource URL: ${url}`,
              type: 'webpage',
            },
          }
        ]
      }
    };

    await axios.post(endpoint, payload, { headers });
    return { success: true, url, documentId };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    return { success: false, url, error: errorMsg };
  }
}

/**
 * Sleep for a given duration
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main import function
 */
async function importSitemapToVertex() {
  try {
    const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID } = process.env;

    if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_DATA_STORE_ID) {
      throw new Error(
        'Missing required env vars: GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID'
      );
    }

    console.log('🔐 Authenticating with Google Cloud...');
    const headers = await getVertexAuthHeaders();

    console.log(`\n📑 Reading sitemap from: ${sitemapPath}`);
    const urls = parseSitemapUrls(sitemapPath);
    console.log(`📊 Found ${urls.length} URLs in sitemap\n`);

    if (urls.length === 0) {
      console.log('⚠️  No URLs found in sitemap');
      return;
    }

    const results = [];
    console.log(`ℹ️  Note: If you see 404 errors below, it may mean:`);
    console.log(`   - The Vertex API is not enabled for this data store`);
    console.log(`   - Try using the web crawler feature in Vertex Discovery Engine console\n`);

    if (useBatch) {
      // Batch import with rate limiting
      console.log(
        `📤 Batch importing (batch size: ${batchSize}, delay: ${delayMs}ms)...\n`
      );

      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(urls.length / batchSize);

        console.log(`\n🔄 Batch ${batchNum}/${totalBatches}`);

        const batchResults = await Promise.all(
          batch.map((url) =>
            addUrlToVertex(url, GCP_PROJECT_ID, GCP_LOCATION, VERTEX_DATA_STORE_ID, headers)
          )
        );

        results.push(...batchResults);

        batchResults.forEach((result) => {
          if (result.success) {
            console.log(`  ✓ ${result.url}`);
          } else {
            console.log(`  ✗ ${result.url} - ${result.error}`);
          }
        });

        // Delay between batches
        if (i + batchSize < urls.length) {
          await sleep(delayMs);
        }
      }
    } else {
      // Sequential import
      console.log('📤 Sequentially importing URLs...\n');

      for (const url of urls) {
        const result = await addUrlToVertex(
          url,
          GCP_PROJECT_ID,
          GCP_LOCATION,
          VERTEX_DATA_STORE_ID,
          headers
        );
        results.push(result);

        if (result.success) {
          console.log(`✓ ${url}`);
        } else {
          console.log(`✗ ${url} - ${result.error}`);
        }
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Import complete: ${successful}/${urls.length} successful`);
    if (failed > 0) {
      console.log(`⚠️  ${failed} URLs failed`);
    }
    console.log('💡 Note: Indexing may take a few minutes.');
    console.log(`${'='.repeat(60)}\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
importSitemapToVertex();
