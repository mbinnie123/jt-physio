#!/usr/bin/env node

/**
 * Vertex Index - Shoulder Exercise URLs
 * 
 * The URLs listed below should be added to your Vertex Discovery Engine data store.
 * Since the API endpoints don't appear to be enabled for this data store configuration,
 * please use one of these methods:
 * 
 * METHOD 1: Manual UI Import (Easiest)
 * ====================================
 * 1. Go to: https://console.cloud.google.com/discovery-engine/
 * 2. Select your data store
 * 3. Click "Add data" or "Import documents"
 * 4. Choose "Website crawl" or "URL upload"
 * 5. Add each URL below
 * 6. Wait for indexing to complete (usually a few minutes)
 * 
 * METHOD 2: Sitemap Upload
 * ========================
 * 1. Create a sitemap.xml with these URLs
 * 2. Upload to your website root (e.g., example.com/sitemap.xml)
 * 3. In Vertex Console, use "Website crawl" and provide the sitemap URL
 * 4. The crawler will automatically index all URLs in the sitemap
 * 
 * METHOD 3: CSV Import
 * ====================
 * Use the CSV file: shoulder-urls.csv
 * Upload via: https://console.cloud.google.com/discovery-engine/
 */

const fs = require('fs');
const path = require('path');

const urls = [
  {
    url: 'https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/',
    title: 'NHS AAA - Shoulder Exercises for Weak and Painful MSK',
    topic: 'shoulder exercises'
  },
  {
    url: 'https://bess.ac.uk/exercises-for-shoulder-pain/',
    title: 'BESS - Exercises for Shoulder Pain',
    topic: 'shoulder pain relief'
  },
  {
    url: 'https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/',
    title: 'Surrey Physio - Top 5 Jo Gibson Shoulder Exercises',
    topic: 'shoulder rehabilitation'
  },
  {
    url: 'https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes',
    title: 'Cirencester Physiotherapy Centre - Shoulder Exercises for Athletes',
    topic: 'athletic shoulder care'
  }
];

// Generate CSV file for import
function generateCSV() {
  const csvContent = [
    ['url', 'title', 'topic', 'content_type'],
    ...urls.map(item => [
      item.url,
      item.title,
      item.topic,
      'webpage'
    ])
  ]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  fs.writeFileSync('shoulder-urls.csv', csvContent);
  console.log('✅ Created: shoulder-urls.csv (for Vertex import)');
}

// Generate sitemap.xml
function generateSitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('shoulder-urls-sitemap.xml', sitemapContent);
  console.log('✅ Created: shoulder-urls-sitemap.xml (for crawler)');
}

// Print instructions
function printInstructions() {
  console.log('\n📚 ADDING SHOULDER EXERCISE URLS TO VERTEX INDEX\n');
  console.log('URLs to add:');
  console.log('─────────────────────────────────────────────────────────');
  urls.forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.title}`);
    console.log(`   URL: ${item.url}`);
    console.log(`   Topic: ${item.topic}`);
  });
  
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('\n🚀 NEXT STEPS:\n');
  console.log('Option A: Web Crawler (Recommended)');
  console.log('  1. Go to: https://console.cloud.google.com/discovery-engine/');
  console.log('  2. Select your data store');
  console.log('  3. Click "Add data" → "Website crawl"');
  console.log('  4. Enter each URL above');
  console.log('  5. Start crawl (usually indexes within 5-10 minutes)\n');
  
  console.log('Option B: CSV Import');
  console.log('  → Use the generated file: shoulder-urls.csv\n');
  
  console.log('Option C: Sitemap Upload');
  console.log('  → Use the generated file: shoulder-urls-sitemap.xml');
  console.log('  → Upload to your website and let crawler discover them\n');
}

// Main
console.clear();
generateCSV();
generateSitemap();
printInstructions();

console.log('📝 Files created:');
console.log('   - shoulder-urls.csv (for Vertex UI import)');
console.log('   - shoulder-urls-sitemap.xml (for web crawler)');
console.log('\n💡 Tip: After URLs are added, you might need to wait 5-10 minutes for full indexing.');
console.log('   Check the Vertex console "Indexing" tab to see status.\n');
