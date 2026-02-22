// Test database loading
const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(process.cwd(), '.blog-db.json');

const data = fs.readFileSync(DB_FILE, 'utf-8');
const parsed = JSON.parse(data);
const drafts = new Map(parsed.drafts || []);

console.log('Map size:', drafts.size);
console.log('First 3 keys:', [...drafts.keys()].slice(0, 3));

// Try to get the first draft
const firstKey = parsed.drafts[0][0];
const draft = drafts.get(firstKey);
console.log('\nDraft found:', !!draft);
console.log('Draft topic:', draft?.topic);
console.log('Draft has researchData:', !!draft?.researchData);
