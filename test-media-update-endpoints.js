#!/usr/bin/env node

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

function createParagraphNode(text) {
  return {
    id: `para-${Date.now()}`, 
    type: 'PARAGRAPH',
    nodes: [{
      id: `text-${Date.now()}`,
      type: 'TEXT',
      nodes: [],
      textData: { text: text, decorations: [] }
    }],
    paragraphData: { textStyle: { textAlignment: 'AUTO' } }
  };
}

async function testUpdateMediaAfterPublish() {
  try {
    console.log('Step 1: Creating and publishing a post without image...\n');
    
    // Create draft
    const draftResponse = await axios.post(
      'https://www.wixapis.com/blog/v3/draft-posts',
      {
        draftPost: {
          title: `Post with Media Update - ${Date.now()}`,
          authorId: WIX_AUTHOR_MEMBER_ID,
          memberId: WIX_AUTHOR_MEMBER_ID,
          richContent: {
            nodes: [createParagraphNode('Test content')],
            metadata: { version: 1 },
            documentStyle: {}
          }
        }
      },
      { headers: wixHeaders }
    );
    
    const draftId = draftResponse.data.draftPost.id;
    console.log('✓ Draft created:', draftId);
    
    // Publish draft
    const publishResponse = await axios.post(
      `https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`,
      {},
      { headers: wixHeaders }
    );
    
    console.log('Publish response:', JSON.stringify(publishResponse.data, null, 2));
    
    const postId = publishResponse.data.post?.id || publishResponse.data.postId;
    if (!postId) {
      console.error('Could not find post ID in publish response');
      return;
    }
    
    // Try to update the post with media
    console.log('\nStep 2: Attempting to update post with featured image...\n');
    
    const updatePayloads = [
      {
        name: 'PUT with media.wixMedia',
        method: 'PUT',
        data: {
          post: {
            media: {
              wixMedia: {
                image: {
                  url: 'https://storage.googleapis.com/image-gen-jt/blog-images/test.png',
                  filename: 'test.png'
                }
              }
            }
          }
        }
      },
      {
        name: 'PUT with coverMedia',
        method: 'PUT',
        data: {
          post: {
            coverMedia: {
              image: { url: 'https://storage.googleapis.com/image-gen-jt/blog-images/test.png' }
            }
          }
        }
      },
      {
        name: 'PATCH with media',
        method: 'PATCH',
        data: {
          post: {
            media: {
              wixMedia: {
                image: {
                  url: 'https://storage.googleapis.com/image-gen-jt/blog-images/test.png',
                  filename: 'test.png'
                }
              }
            }
          }
        }
      }
    ];
    
    for (const payload of updatePayloads) {
      console.log(`\n📝 ${payload.name}`);
      console.log('---');
      
      try {
        const response = await axios({
          method: payload.method,
          url: `https://www.wixapis.com/blog/v3/posts/${postId}`,
          data: payload.data,
          headers: wixHeaders,
          timeout: 5000
        });
        
        console.log(`✓ Success! Updated post`);
        console.log('  Media after update:', JSON.stringify(response.data.post?.media));
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`✗ Endpoint not found (404)`);
        } else {
          console.log(`✗ Error ${err.response?.status}: ${err.response?.data?.message || err.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpdateMediaAfterPublish();
