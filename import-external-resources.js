#!/usr/bin/env node

/**
 * Import external resource URLs to Vertex Data Store
 * 
 * Fetches content from URLs and imports them as documents to Vertex
 * 
 * Usage:
 *   node import-external-resources.js
 *   node import-external-resources.js --batch
 *   node import-external-resources.js https://example.com https://example2.com
 */

const fs = require('fs');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';

// Default external resources to import
const DEFAULT_URLS = [
  'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
  'https://bess.ac.uk/exercises-for-shoulder-pain/',
  'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
  'https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes',
  'https://dinesorthopedics.com/forbes-dont-worry-egypt-mohamed-salahs-shoulder-injury-shouldnt-keep-him-out-of-world-cup/',
];

async function getAccessToken() {
  try {
    // Use direct service account auth (gcloud can have cache issues)
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

async function fetchAndExtractContent(url) {
  try {
    console.log(`  📥 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JT-Physio-Bot/1.0)'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title
    let title = $('h1').first().text().trim() ||
                $('title').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                'External Resource';

    // Clean title
    title = title.replace(/\s+/g, ' ').substring(0, 200);

    // Extract main content
    const content = $('main, article, [role="main"]').text() ||
                   $('body').text();
    
    // Clean content - remove scripts, styles, and extra whitespace
    let cleanContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to 5000 chars for Vertex

    if (!cleanContent || cleanContent.length < 50) {
      // Fallback: use meta description
      cleanContent = $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') ||
                    'Content extraction failed';
    }

    return {
      title,
      content: cleanContent,
      url
    };
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${url}:`, error.message);
    return null;
  }
}

async function importResourceToVertex(url, title, content, token) {
  try {
    const documentId = `external-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseUrl = LOCATION === 'global' 
      ? 'https://discoveryengine.googleapis.com'
      : `https://${LOCATION}-discoveryengine.googleapis.com`;
    
    const endpoint = `${baseUrl}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import`;
    
    const payload = {
      inlineSource: {
        documents: [
          {
            id: documentId,
            structData: {
              title: title,
              url: url,
              content: content,
              type: 'external_resource',
              source: new URL(url).hostname
            }
          }
        ]
      }
    };

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    return {
      success: true,
      documentId: documentId,
      url
    };
  } catch (error) {
    console.error(`    ❌ Import failed for ${url}:`, error.response?.data?.error?.message || error.message);
    return {
      success: false,
      url,
      error: error.message
    };
  }
}

async function main() {
  try {
    // Validate environment
    if (!PROJECT_ID || !DATA_STORE_ID) {
      console.error('❌ Missing required environment variables:');
      if (!PROJECT_ID) console.error('   - GCP_PROJECT_ID');
      if (!DATA_STORE_ID) console.error('   - VERTEX_DATA_STORE_ID');
      process.exit(1);
    }

    // Get URLs from arguments or use defaults
    let urls = process.argv.slice(2).filter(arg => 
      arg.startsWith('http://') || arg.startsWith('https://')
    );
    
    if (urls.length === 0) {
      urls = DEFAULT_URLS;
      console.log('📋 Using default external resources from shoulder-urls-sitemap.xml\n');
    } else {
      console.log(`📋 Importing ${urls.length} provided URL(s)\n`);
    }

    const token = await getAccessToken();
    console.log('✅ Authenticated with Google Cloud\n');

    console.log(`🔍 Fetching content from ${urls.length} URL(s)...\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const url of urls) {
      console.log(`\n📄 Processing: ${url}`);
      
      // Fetch content
      const extracted = await fetchAndExtractContent(url);
      if (!extracted) {
        failureCount++;
        continue;
      }

      // Import to Vertex
      const result = await importResourceToVertex(
        extracted.url,
        extracted.title,
        extracted.content,
        token
      );

      if (result.success) {
        console.log(`   ✅ Imported successfully`);
        console.log(`      Title: ${extracted.title.substring(0, 60)}...`);
        console.log(`      Doc ID: ${result.documentId}`);
        successCount++;
      } else {
        console.log(`   ❌ Import failed: ${result.error}`);
        failureCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successful: ${successCount}/${urls.length}`);
    if (failureCount > 0) {
      console.log(`   ❌ Failed: ${failureCount}/${urls.length}`);
    }

    console.log('\n⏱️  Timeline:');
    console.log('   1. Resources imported: ✅');
    console.log('   2. Indexing in progress: (10-30 minutes)');
    console.log('   3. Available for search: ~2-4 hours');

    console.log('\n💡 To verify indexed documents:');
    console.log('   node verify-indexed-documents.js\n');

    process.exit(successCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
