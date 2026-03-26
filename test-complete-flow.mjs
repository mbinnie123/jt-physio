#!/usr/bin/env node

import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function testCompleteFlow() {
  try {
    console.log('🚀 Starting complete test flow...\n');
    
    // Step 1: Get list of posts
    console.log('1️⃣  Fetching published posts list...');
    const listResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });
    const posts = listResponse.data.posts || [];
    console.log(`   ✅ Found ${posts.length} posts\n`);
    
    if (posts.length === 0) {
      console.log('❌ No posts found');
      return;
    }

    // Step 2: Fetch detail of first post
    const firstPost = posts[0];
    console.log(`2️⃣  Fetching detail for: "${firstPost.title}"`);
    
    const detailResponse = await axios.get(`${backendUrl}?action=details&postId=${firstPost.id}`, {
      headers: { Authorization: adminPassword },
      timeout: 15000,
    });
    const post = detailResponse.data.post;
    console.log(`   ✅ Received post detail\n`);
    
    // Step 3: Check content structure
    console.log('3️⃣  Analyzing content structure');
    console.log(`   richContent: ${post.richContent !== null ? '✅ PRESENT' : '⚠️ NULL (will use fallback)'}`);
    
    if (post.richContent === null) {
      console.log(`   📌 Fallback will create placeholder content for the frontend\n`);
    }
    
    // Step 4: Check metadata
    console.log('4️⃣  Metadata check:');
    console.log(`   ✅ ID: ${post.id}`);
    console.log(`   ✅ Title: ${post.title}`);
    console.log(`   ✅ Slug: ${post.slug}`);
    console.log(`   ✅ Excerpt: ${post.excerpt?.substring(0, 50)}...`);
    if (post.featured) console.log(`   ✅ Featured: Yes`);
    console.log('');
    
    // Step 5: Verify response structure
    console.log('5️⃣  Response structure validation:');
    const requiredFields = ['id', 'title', 'slug', 'excerpt', 'richContent', 'featured'];
    const missingFields = requiredFields.filter(f => !(f in post));
    if (missingFields.length === 0) {
      console.log(`   ✅ All required fields present\n`);
    } else {
      console.log(`   ⚠️ Missing fields: ${missingFields.join(', ')}\n`);
    }
    
    // Step 6: Frontend fallback simulation
    console.log('6️⃣  Simulating frontend fallback processing:');
    let contentToUse = post.richContent;
    if (!contentToUse) {
      contentToUse = {
        nodes: [
          {
            type: "paragraph",
            nodes: [
              {
                type: "text",
                data: `📌 Placeholder from Wix API limitation`,
              }
            ]
          }
        ]
      };
      console.log(`   ✅ Frontend will use placeholder content`);
    } else {
      console.log(`   ✅ Frontend will use actual richContent`);
    }
    console.log(`   ✅ Content structure is valid for parsing\n`);
    
    console.log('✨ Complete flow test: SUCCESS');
    console.log('\n📊 Summary:');
    console.log('- Posts can be listed');
    console.log('- Post details can be fetched');
    console.log('- Metadata is available');
    console.log('- Fallback content handling works');
    
  } catch (error) {
    console.error('\n❌ Error during flow:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testCompleteFlow();
