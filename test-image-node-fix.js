#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JtPhysio_Admin_2026!9kP';

async function testFix() {
  try {
    console.log('Testing featured image fix (should be in IMAGE node, not coverMedia)...\n');
    
    // Create draft
    console.log('1️⃣ Creating draft...');
    const researchResponse = await axios.post(
      `${API_BASE}/api/blog/research`,
      {
        topic: 'Sports Injury Recovery Test',
        location: 'Glasgow',
        sport: 'Football',
        numSections: 1,
      },
      { headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` }, timeout: 30000 }
    );

    const draftId = researchResponse.data?.draft?.id;
    console.log(`   ✓ Draft created: ${draftId}\n`);

    // Add a section
    console.log('2️⃣ Adding section...');
    await axios.post(
      `${API_BASE}/api/blog/write-section`,
      {
        draftId,
        sectionTitle: 'Recovery Tips',
        sectionNumber: 1,
        tone: 'professional',
        targetAudience: 'athletes',
        targetWords: 150,
      },
      { headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` }, timeout: 30000 }
    );
    console.log('   ✓ Section added\n');

    // Publish
    console.log('3️⃣ Publishing draft (with auto image generation)...');
    const publishResponse = await axios.post(
      `${API_BASE}/api/blog/publish`,
      { draftId },
      { headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` }, timeout: 60000 }
    );

    const postData = publishResponse.data;
    console.log(`   ✓ Published!`);
    console.log(`   Post ID: ${postData.blogPost?.id || postData.postId}`);
    console.log(`   Featured image: ${postData.blogPost?.featuredImageUrl ? '✓ YES' : '✗ NO'}\n`);

    // Fetch the published post from Wix to verify image node was added
    if (postData.postId) {
      console.log('4️⃣ Verifying image preservation in Wix...');
      
      // Get from our local DB to confirm featured image was set
      const wixHeaders = {
        'Authorization': process.env.WIX_API_KEY,
        'wix-site-id': process.env.WIX_SITE_ID,
        'Content-Type': 'application/json'
      };
      
      try {
        const wixResponse = await axios.get(
          `https://www.wixapis.com/blog/v3/posts/${postData.postId}?fieldsets=RICH_CONTENT`,
          { headers: wixHeaders }
        );
        
        const post = wixResponse.data.post;
        const nodes = post.richContent?.nodes || [];
        const imageNode = nodes.find(n => n.type === 'IMAGE');
        
        if (imageNode) {
          const imgUrl = imageNode.imageData?.image?.src?.url;
          console.log(`   ✓ IMAGE node found in richContent!`);
          console.log(`   Image URL: ${imgUrl?.substring(0, 60)}...`);
          console.log('\n✅ SUCCESS: Featured image is embedded and should display!');
        } else {
          console.log(`   ✗ No IMAGE node found`);
          console.log(`   Nodes: ${nodes.map(n => n.type).join(', ')}`);
        }
      } catch (err) {
        console.log('   ⚠ Could not verify in Wix:', err.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

testFix();
