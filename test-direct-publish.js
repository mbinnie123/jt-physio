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
    #!/usr/bin/env node

require('dotenv').config({ path: '/Users/marcusbinnise
require('dotenv')staconst axios = require('axios');

const API_BASE = 'http://localhost:3000';
con  
const API_tAudience: 'runners',
const ADMIN_PASSWORD = process.e: {
      
async function testPublish() {
  try {
    // Ste     },
      }
    );

    con  try {
    // Step 1: Resear;
    ///     console.log('\n1. Creating draft via resea.     const researchResponse = await axios.post(
      ` p      `${API_BASE}/api/blog/research`,
      PI      {
        topic: 'Knee Injury Rft                location: 'Glasgow',
        sport: 'Runn `        sport: 'Running',
           numSections: 2,

       },
      {
     bl      {po      ;
          Authg(JSO        },
      }
    );

    const draftId = reseat      }
 )     );co
    .er    console.log('✓ Draft created:', draftId);

   ;

    // Step 2: Wr);
  }
}

testPublish();
