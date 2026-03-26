#!/usr/bin/env node

import axios from 'axios';

const adminPassword = 'JtPhysio_Admin_2026!9kP';
const backendUrl = 'http://localhost:3000/api/blog/wix-posts';

async function testListEndpoint() {
  try {
    console.log('🔍 Fetching published posts list...\n');
    
    const listResponse = await axios.get(backendUrl, {
      headers: {
        Authorization: adminPassword,
      },
      timeout: 15000,
    });

    const posts = listResponse.data.posts || [];
    console.log(`✅ Found ${posts.length} posts\n`);
    
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }

    // Check first post in list
    const firstPost = posts[0];
    console.log(`📄 First post in list response:
  ID: ${firstPost.id}
  Title: ${firstPost.title}
  slug: ${firstPost.slug}
  excerpt: ${firstPost.excerpt}\n`);
    
    console.log('🔍 Content fields in list response:');
    console.log(`  richContent: ${firstPost.richContent ? '✅ Present' : '❌ Missing'}`);
    console.log(`  htmlBody: ${firstPost.htmlBody ? '✅ Present' : '❌ Missing'}`);
    console.log(`  plainContent: ${firstPost.plainContent ? '✅ Present' : '❌ Missing'}`);
    console.log(`  content: ${firstPost.content ? '✅ Present' : '❌ Missing'}`);
    console.log('');
    
    // Show all available fields in list response
    console.log('📋 All available fields in list response:');
    const fields = Object.keys(firstPost).sort();
    console.log(fields.join(', '));
    console.log('');
    
    // Show values of all fields
    console.log('📊 Field values:');
    fields.forEach(field => {
      const value = firstPost[field];
      if (typeof value === 'string') {
        const preview = value.length > 50 ? value.substring(0, 47) + '...' : value;
        console.log(`  ${field}: "${preview}"`);
      } else if (typeof value === 'boolean') {
        console.log(`  ${field}: ${value}`);
      } else if (typeof value === 'object') {
        console.log(`  ${field}: [${typeof value} with keys: ${Object.keys(value).join(', ')}]`);
      } else {
        console.log(`  ${field}: ${value}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testListEndpoint();
