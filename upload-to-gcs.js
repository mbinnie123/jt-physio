#!/usr/bin/env node

/**
 * Upload external resources to Google Cloud Storage
 * Then Vertex can import from the bucket
 * 
 * Usage:
 *   node upload-to-gcs.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const BUCKET_NAME = 'jt-physio-documents';

// Shoulder exercise URLs
const URLS = [
  'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
  'https://bess.ac.uk/exercises-for-shoulder-pain/',
  'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
  'https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes',
  'https://dinesorthopedics.com/forbes-dont-worry-egypt-mohamed-salahs-shoulder-injury-shouldnt-keep-him-out-of-world-cup/',
];

async function fetchAndExtractContent(url) {
  try {
    console.log(`   📥 Fetching: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PhysioBot/1.0)'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Remove script, style, and nav elements
    $('script, style, nav, footer, .sidebar, .comment').remove();
    
    // Extract title
    const title = $('h1').first().text() || $('title').text() || new URL(url).hostname;
    
    // Extract main content
    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 20000); // Limit to 20,000 chars (well under the 1 MB raw_bytes limit)

    return {
      title: title.substring(0, 100),
      url,
      content: content || 'Unable to extract content',
      source: new URL(url).hostname
    };
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${url}:`, error.message);
    return null;
  }
}

async function uploadToGCS(documents, filename) {
  try {
    const storage = new Storage({
      projectId: PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const bucket = storage.bucket(BUCKET_NAME);
    // Use a timestamped filename to keep history, and also maintain a stable "-latest" alias
    const baseName = filename.replace('.jsonl', '');
    const timestampedFilename = `${baseName}-${Date.now()}.jsonl`;
    const latestFilename = `${baseName}-latest.jsonl`;

    const file = bucket.file(timestampedFilename);
    const latestFile = bucket.file(latestFilename);

    // Convert to JSONL format (one object per line)
    const jsonlContent = documents
      .map(doc => JSON.stringify(doc))
      .join('\n');

    // Upload the JSONL file (timestamped)
    await file.save(jsonlContent, {
      metadata: {
        contentType: 'application/x-ndjson',
      }
    });

    // Also upload/overwrite a stable "-latest" alias so imports don't accidentally pick up old/bad files
    await latestFile.save(jsonlContent, {
      metadata: {
        contentType: 'application/x-ndjson',
      }
    });

    return {
      success: true,
      filename: timestampedFilename,
      latestFilename,
      documentCount: documents.length
    };
  } catch (error) {
    console.error(`    ❌ Upload failed for ${filename}:`, error.message);
    return {
      success: false,
      filename,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔄 Uploading shoulder exercise resources to Google Cloud Storage\n');
  console.log(`📦 Bucket: gs://${BUCKET_NAME}/`);
  console.log(`📍 Project: ${PROJECT_ID}\n`);

  if (!PROJECT_ID || !BUCKET_NAME) {
    console.error('❌ Missing required configuration:');
    if (!PROJECT_ID) console.error('   - GCP_PROJECT_ID');
    process.exit(1);
  }

  const documents = [];
  let successCount = 0;
  let failureCount = 0;

  // Fetch all documents first
  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    console.log(`\n[${i + 1}/${URLS.length}] Fetching: ${url}`);

    const extracted = await fetchAndExtractContent(url);
    if (!extracted) {
      failureCount++;
      continue;
    }

    // Create Vertex document structure - valid format for Vertex AI
    // For unstructured documents with metadata, store content in structData
    const documentId = `shoulder-resource-${i + 1}`;
    const vertexDoc = {
      id: documentId,
      // Store metadata and content in structData (required for Vertex AI schema)
      structData: {
        title: extracted.title,
        url: extracted.url,
        source: extracted.source,
        content: extracted.content,
        excerpt: extracted.content.substring(0, 300) // First 300 chars as excerpt
      }
    };

    documents.push(vertexDoc);
    console.log(`   ✅ Extracted: ${extracted.title}`);
    successCount++;

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Upload all documents in a single JSONL file
  if (documents.length > 0) {
    console.log('\n📤 Uploading to GCS as JSONL...');
    const uploadResult = await uploadToGCS(documents, 'shoulder-resources.jsonl');

    if (uploadResult.success) {
      console.log(`   ✅ Uploaded (timestamped): gs://${BUCKET_NAME}/${uploadResult.filename}`);
      console.log(`   ✅ Uploaded (latest):      gs://${BUCKET_NAME}/${uploadResult.latestFilename}`);
      console.log(`   📋 Documents: ${uploadResult.documentCount}`);
    } else {
      console.log(`   ❌ Upload failed: ${uploadResult.error}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fetched: ${successCount}/${URLS.length}`);
  console.log(`   ❌ Failed: ${failureCount}/${URLS.length}`);

  console.log('\n📋 Next Steps:');
  console.log(`   1. Run: node import-from-gcs.js "${process.env.GCS_INPUT_PATTERN || 'shoulder-resources-latest.jsonl'}"`);
  console.log(`   2. Vertex will import from the stable "-latest" file to avoid importing old/bad JSONL.`);
  console.log(`   3. Documents will be indexed within 10-30 minutes`);
  console.log('\n✨ Files are ready in Google Cloud Storage!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
