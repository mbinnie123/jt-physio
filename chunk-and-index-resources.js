#!/usr/bin/env node

/**
 * Chunk and Index External Resources to Vertex
 * 
 * Fetches content from external URLs, splits into chunks with metadata,
 * and indexes them to Vertex Data Store for better search performance.
 * 
 * Usage:
 *   node chunk-and-index-resources.js                    # Default URLs, direct import
 *   node chunk-and-index-resources.js --gcs              # Upload to GCS first
 *   node chunk-and-index-resources.js --save             # Save NDJSON locally
 */

const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATA_STORE_ID = process.env.VERTEX_DATA_STORE_ID;
const LOCATION = process.env.GCP_LOCATION || 'global';
const BUCKET_NAME = 'jt-physio-documents';

// Shoulder exercise resources
const SHOULDER_URLS = [
  {
    url: 'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
    title: 'NHS - Shoulder Exercises for Weak and Painful Shoulders',
    source: 'NHS AAA',
    keywords: ['shoulder', 'exercises', 'weak', 'painful', 'rehabilitation']
  },
  {
    url: 'https://bess.ac.uk/exercises-for-shoulder-pain/',
    title: 'BESS - Exercises for Shoulder Pain',
    source: 'British Elbow and Shoulder Society',
    keywords: ['shoulder', 'pain', 'exercises', 'therapy', 'rehabilitation']
  },
  {
    url: 'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
    title: 'Surrey Physio - Top 5 Shoulder Exercises',
    source: 'Surrey Physiotherapy',
    keywords: ['shoulder', 'exercises', 'physiotherapy', 'top exercises']
  },
  {
    url: 'https://www.cirencesterphysiotherapycentre.co.uk/shoulder-pain/',
    title: 'Cirencester Physio - Shoulder Pain Management',
    source: 'Cirencester Physiotherapy Centre',
    keywords: ['shoulder', 'pain', 'management', 'physio', 'treatment']
  },
  {
    url: 'https://dinesorthopedics.com/shoulder-exercises/',
    title: 'Dines Orthopedics - Shoulder Exercises',
    source: 'Dines Orthopedics',
    keywords: ['shoulder', 'exercises', 'orthopedic', 'rehabilitation']
  }
];

// Constants
const CHUNK_SIZE = 800; // words per chunk
const CHUNK_OVERLAP = 100; // overlap between chunks
const MIN_CHUNK_SIZE = 200; // minimum words for a valid chunk

/**
 * Extract text content from HTML
 */
function extractTextFromHtml(html) {
  const $ = cheerio.load(html);
  
  // Remove script and style tags
  $('script').remove();
  $('style').remove();
  $('nav').remove();
  $('footer').remove();
  $('[role="navigation"]').remove();
  
  // Get main content (prefer article, main, or content divs)
  let content = $('article').text() || 
                $('main').text() || 
                $('[role="main"]').text() ||
                $('body').text();
  
  // Clean up whitespace
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  return content;
}

/**
 * Split text into chunks with overlap
 */
function createChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    
    if (chunk.split(/\s+/).length >= MIN_CHUNK_SIZE) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Extract key phrases/sentences for excerpt
 */
function extractExcerpt(text, maxLength = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let excerpt = '';
  
  for (const sentence of sentences) {
    if ((excerpt + sentence).length <= maxLength) {
      excerpt += sentence;
    } else {
      break;
    }
  }
  
  return excerpt.trim() || text.substring(0, maxLength);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text, sourceKeywords = []) {
  // Common words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'could', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how'
  ]);
  
  // Extract words, clean, and filter
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4 && !stopWords.has(w));
  
  // Count frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Get top keywords
  const topKeywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  // Combine with source keywords
  return [...new Set([...sourceKeywords.map(k => k.toLowerCase()), ...topKeywords])];
}

/**
 * Fetch and parse URL content
 */
async function fetchAndParse(resourceConfig) {
  try {
    console.log(`📥 Fetching: ${resourceConfig.title}`);
    const response = await axios.get(resourceConfig.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Physiotherapy Bot)'
      }
    });
    
    const text = extractTextFromHtml(response.data);
    if (!text || text.length < 100) {
      throw new Error('Extracted text too short');
    }
    
    console.log(`✓ Extracted ${text.length} characters of content`);
    return text;
  } catch (error) {
    console.error(`✗ Failed to fetch ${resourceConfig.title}: ${error.message}`);
    return null;
  }
}

/**
 * Generate a short hash ID (max 128 chars for Vertex)
 */
function generateShortId(resourceUrl, chunkIndex) {
  const hash = crypto.createHash('md5')
    .update(resourceUrl)
    .digest('hex')
    .substring(0, 8);
  return `chunk-${hash}-${chunkIndex}`;
}

/**
 * Create document chunks with metadata
 */
async function createDocumentChunks(resourceConfig) {
  const content = await fetchAndParse(resourceConfig);
  if (!content) return [];
  
  const chunks = createChunks(content);
  const excerpt = extractExcerpt(content);
  const keywords = extractKeywords(content, resourceConfig.keywords);
  
  console.log(`📦 Created ${chunks.length} chunks from ${resourceConfig.title}\n`);
  
  // Create document for each chunk
  return chunks.map((chunkText, index) => ({
    id: generateShortId(resourceConfig.url, index),
    structData: {
      title: `${resourceConfig.title} (Part ${index + 1}/${chunks.length})`,
      url: resourceConfig.url,
      source: resourceConfig.source,
      excerpt: excerpt,
      keywords: keywords.join(', '),
      chunkIndex: index,
      totalChunks: chunks.length,
      contentType: 'exercise-guide',
      language: 'en',
      indexed_at: new Date().toISOString(),
      content: chunkText
    }
  }));
}

/**
 * Get Vertex auth headers
 */
async function getVertexAuthHeaders() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  if (!token || !token.token) {
    throw new Error('Failed to obtain Vertex access token');
  }
  
  return {
    'Authorization': `Bearer ${token.token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Import chunks directly to Vertex
 */
async function importChunksToVertex(allChunks) {
  if (allChunks.length === 0) {
    console.error('❌ No chunks to import');
    return;
  }
  
  try {
    console.log(`🔐 Authenticating with Google Cloud...`);
    const headers = await getVertexAuthHeaders();
    
    const baseUrl = LOCATION === 'global'
      ? 'https://discoveryengine.googleapis.com'
      : `https://${LOCATION}-discoveryengine.googleapis.com`;
    
    const endpoint = `${baseUrl}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import`;
    
    console.log(`\n📤 Importing ${allChunks.length} chunks to Vertex...\n`);
    
    // Batch chunks (Vertex API can handle multiple documents)
    const batchSize = 50;
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      
      try {
        const payload = {
          inlineSource: {
            documents: batch
          }
        };
        
        await axios.post(endpoint, payload, { headers });
        console.log(`✓ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} chunks)`);
      } catch (error) {
        console.error(`✗ Failed to import batch: ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    console.log(`\n✅ Import complete!`);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Save chunks as NDJSON
 */
function saveChunksAsNDJSON(allChunks, filename = 'shoulder-chunks.ndjson') {
  const ndjson = allChunks
    .map(chunk => JSON.stringify(chunk))
    .join('\n');
  
  fs.writeFileSync(filename, ndjson);
  console.log(`✅ Saved ${allChunks.length} chunks to ${filename}`);
}

/**
 * Upload chunks to GCS
 */
async function uploadChunksToGCS(allChunks) {
  try {
    const storage = new Storage({
      projectId: PROJECT_ID,
    });
    
    const bucket = storage.bucket(BUCKET_NAME);
    const filename = `shoulder-chunks-${Date.now()}.ndjson`;
    
    const ndjson = allChunks
      .map(chunk => JSON.stringify(chunk))
      .join('\n');
    
    await bucket.file(filename).save(ndjson);
    console.log(`✅ Uploaded to GCS: gs://${BUCKET_NAME}/${filename}`);
    
    return `gs://${BUCKET_NAME}/${filename}`;
  } catch (error) {
    console.error('❌ GCS upload failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main process
 */
async function main() {
  console.log('🚀 Chunking and Indexing Shoulder Exercise Resources\n');
  console.log('═'.repeat(60));
  
  // Parse command line args
  const useGCS = process.argv.includes('--gcs');
  const saveLocal = process.argv.includes('--save');
  
  // Create chunks from all resources
  console.log('📂 Processing resources...\n');
  const allChunks = [];
  
  for (const resource of SHOULDER_URLS) {
    const chunks = await createDocumentChunks(resource);
    allChunks.push(...chunks);
  }
  
  console.log('═'.repeat(60));
  console.log(`\n📊 Summary: ${allChunks.length} total chunks created\n`);
  
  // Handle output
  if (useGCS) {
    console.log('☁️  Uploading to GCS...');
    await uploadChunksToGCS(allChunks);
    console.log('\n💡 Next: node import-from-gcs.js shoulder-chunks-*.ndjson');
  } else if (saveLocal) {
    saveChunksAsNDJSON(allChunks);
    console.log('\n💡 Next: node import-from-gcs.js shoulder-chunks.ndjson');
  } else {
    console.log('📤 Importing directly to Vertex...');
    await importChunksToVertex(allChunks);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
