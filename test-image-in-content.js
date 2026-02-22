#!/usr/bin/env node

/**
 * Based on Wix API exploration:
 * 
 * Issue: When publishing blog posts with GCS URLs via coverMedia, 
 * Wix returns media: { displayed: true, custom: false } but no wixMedia object
 *
 * Publishing posts with images in Wix seems to require:
 * 1. Images must be in Wix's Media Manager (not external URLs)
 * 2. Posts can reference media with wixMedia.image.id + wixMedia.image.url
 * 3. Media Manager uploads are NOT exposed via Blog v3 API
 *
 * Solutions to try:
 * 1. Use the Wix Media Manager API (if available)
 * 2. Use a Wix plugin/package that handles media uploads
 * 3. Store images in GCS and embed them as <img> tags in richContent instead of coverMedia
 * 4. Use the Wix Files API to upload images
 * 5. Manually add images through Wix dashboard (not API)
 *
 * Most promising: Store images inline in the post content as IMAGE nodes instead of relying on coverMedia
 */

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_AUTHOR_MEMBER_ID = process.env.WIX_AUTHOR_MEMBER_ID;

if (!WIX_API_KEY || !WIX_SITE_ID || !WIX_AUTHOR_MEMBER_ID) {
  console.error('Missing WIX variables');
  process.exit(1);
}

const wixHeaders = {
  'Authorization': WIX_API_KEY,
  'wix-site-id': WIX_SITE_ID,
  'Content-Type': 'application/json'
};

function createTextNode(text) {
  return {
    id: `text-${Date.now()}`,
    type: 'TEXT',
    nodes: [],
    textData: { text: text, decorations: [] }
  };
}

function createParagraphNode(text) {
  return {
    id: `para-${Date.now()}`, 
    type: 'PARAGRAPH',
    nodes: [createTextNode(text)],
    paragraphData: { textStyle: { textAlignment: 'AUTO' } }
  };
}

// IMAGE node with external (GCS) URL
function createImageNode(url, alt = 'Featured image') {
  return {
    id: `img-${Date.now()}`,
    type: 'IMAGE',
    imageData: {
      image: {
        src: {
          url: url
        }
      },
      altText: alt
    }
  };
}

async function testImageInContent() {
  try {
    console.log('📝 Test: Adding image as IMAGE node in richContent (not coverMedia)\n');
    
    const imageUrl = 'https://storage.googleapis.com/image-gen-jt/blog-images/test.png';
    
    // Create a draft with image embedded in content
    const draftPayload = {
      draftPost: {
        title: `Post with Embedded Image - ${Date.now()}`,
        authorId: WIX_AUTHOR_MEMBER_ID,
        memberId: WIX_AUTHOR_MEMBER_ID,
        richContent: {
          nodes: [
            createImageNode(imageUrl, 'Test featured image'),  // Image at top
            createParagraphNode('This post has an image embedded in the content via an IMAGE node.'),
            createParagraphNode('If this works, we can use this approach instead of relying on coverMedia!')
          ],
          metadata: { version: 1 },
          documentStyle: {}
        }
      }
    };

    console.log('Creating draft with IMAGE node...');
    const draftResponse = await axios.post(
      'https://www.wixapis.com/blog/v3/draft-posts',
      draftPayload,
      { headers: wixHeaders }
    );
    
    const draftId = draftResponse.data.draftPost.id;
    console.log('✓ Draft created:', draftId);
    
    // Publish it
    console.log('\nPublishing draft...');
    const publishResponse = await axios.post(
      `https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`,
      {},
      { headers: wixHeaders }
    );
    
    const postId = publishResponse.data.postId;
    console.log('✓ Post published:', postId);
    
    // Fetch the post to see what happened to the image
    console.log('\nFetching published post to check image...');
    const getResponse = await axios.get(
      `https://www.wixapis.com/blog/v3/posts/${postId}?fieldsets=RICH_CONTENT`,
      { headers: wixHeaders }
    );
    
    const post = getResponse.data.post;
    console.log('\n✓ Post retrieved');
    console.log('  Title:', post.title);
    console.log('  Media:', JSON.stringify(post.media));
    
    // Try multiple paths to get richContent
    const richContent = post.richContent || post.content?.richContent || post.content;
    
    if (richContent) {
      if (typeof richContent === 'object') {
        console.log('  richContent structure:', typeof richContent);
        console.log('  richContent keys:', Object.keys(richContent));
        
        const nodes = richContent.nodes || richContent?.nodes;
        if (Array.isArray(nodes)) {
          console.log('  Number of nodes:', nodes.length);
          console.log('  Node types:', nodes.map((n, i) => `${i}: ${n.type}`).join(', '));
          
          // Find IMAGE nodes
          const imageNodes = nodes.filter(n => n.type === 'IMAGE');
          if (imageNodes.length > 0) {
            console.log('\n  ✓ Found', imageNodes.length, 'IMAGE node(s)!');
            imageNodes.forEach((img, idx) => {
              const src = img.imageData?.image?.src?.url || img.imageData?.src?.url;
              if (src) {
                console.log(`    Image ${idx + 1} URL:`, src.substring(0, 60) + '...');
              }
            });
          } else {
            console.log('\n  ✗ No IMAGE nodes found in content');
          }
        }
      } else {
        console.log('  richContent type:', typeof richContent);
        if (typeof richContent === 'string') {
          console.log('  (richContent is a JSON string)');
          try {
            const parsed = JSON.parse(richContent);
            console.log('  Parsed keys:', Object.keys(parsed));
          } catch (e) {
            console.log('  Failed to parse as JSON');
          }
        }
      }
    } else {
      console.log('  ✗ No richContent found');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
  }
}

testImageInContent();
