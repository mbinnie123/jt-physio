#!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnie/jt-physio/.env.local' });
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JtPhysio_Admin_2026!9kP';

async function testPublish() {
  try {
    // Step 1: Research phase to create a draft
    console.log('\n1. Creating draft via research...');
    const researchResponse = await axios.post(
      `${API_BASE}/api/blog/research`,
      {
        topic: 'Knee Injury Recovery for Runners',
        location: 'Glasgow',
        sport: 'Running',
        numSections: 2,
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_PASSWORD}`,
        },
      }
    );

    const draftId = researchResponse.data?.draft?.id;
    console.log('✓ Draft created:', draftId);

    // Step 2: Write a quick section
    console.log('\n2. Adding section...');
    await axios.post(
      `${API_BASE}/api/blog/write-section`,
      {
        draftId,
        sectionTitle: 'Understanding Knee Injuries',
        sectionNumber: 1,
        tone: 'professional',
        targetAudience: 'runners',
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_PASSWORD}`,
        },
      }
    );

    console.log('✓ Section added');

    // Step 3: Publish the draft
    console.log('\n3. Publishing draft with image generation...');
    const publishResponse = await axios.post(
      `${API_BASE}/api/blog/publish`,
      { draftId },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_PASSWORD}`,
        },
      }
    );

    console.log('✓ Publish response:');
    console.log(JSON.stringify(publishResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPublish();
