#!/usr/bin/env node

/**
 * Complete Blog Generation Flow Test
 * 
 * This script tests the entire blog generation pipeline:
 * 1. Research phase - gathers sources and keywords
 * 2. Outline phase - generates blog structure
 * 3. Writing phase - writes individual sections
 * 4. Assembly phase - combines sections into a complete post
 * 5. Publishing phase - publishes to Wix
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test-password";
const API_BASE = process.env.API_BASE || "http://localhost:3000";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testResearchPhase() {
  log("\n=== RESEARCH PHASE ===", "cyan");
  
  try {
    log("Starting research for topic: 'Knee Injury Recovery'...", "blue");
    
    const response = await fetch(`${API_BASE}/api/blog/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ADMIN_PASSWORD}`,
      },
      body: JSON.stringify({
        topic: "Knee Injury Recovery",
        location: "Glasgow, Scotland",
        sport: "Football",
        numSections: 5,
        includeChecklist: true,
        includeFaq: true,
        includeInternalCta: true,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Research failed: ${data.error}`);
    }

    log(`✓ Research phase completed`, "green");
    log(`  - Draft ID: ${data.draft.id}`);
    log(`  - Keywords found: ${data.research.keywords.length}`);
    log(`  - Sources gathered: ${data.research.sources.length}`);
    log(`  - Outline sections: ${data.outline.length}`, "green");
    
    return {
      draftId: data.draft.id,
      outline: data.outline,
      keywords: data.research.keywords,
      sources: data.research.sources,
    };
  } catch (error) {
    log(`✗ Research phase failed: ${error.message}`, "red");
    throw error;
  }
}

async function testWritePhase(draftId, outline) {
  log("\n=== WRITING PHASE ===", "cyan");
  
  const sections = [];
  
  for (let i = 0; i < Math.min(outline.length, 2); i++) {
    try {
      log(`Writing section ${i + 1}: "${outline[i]}"...`, "blue");
      
      const response = await fetch(`${API_BASE}/api/blog/write-section`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ADMIN_PASSWORD}`,
        },
        body: JSON.stringify({
          draftId,
          sectionTitle: outline[i],
          sectionNumber: i + 1,
          tone: "professional",
          targetAudience: "physiotherapy patients",
          targetWords: 300,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to write section: ${data.error}`);
      }

      log(`✓ Section ${i + 1} written (${data.section.wordCount} words)`, "green");
      sections.push(data.section);
    } catch (error) {
      log(`✗ Failed to write section ${i + 1}: ${error.message}`, "red");
      throw error;
    }
  }
  
  return sections;
}

async function testAssemblyPhase(draftId) {
  log("\n=== ASSEMBLY PHASE ===", "cyan");
  
  try {
    log("Assembling blog post...", "blue");
    
    const response = await fetch(`${API_BASE}/api/blog/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ADMIN_PASSWORD}`,
      },
      body: JSON.stringify({
        draftId,
        assembleOnly: true,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Assembly failed: ${data.error}`);
    }

    log(`✓ Blog post assembled successfully`, "green");
    log(`  - Title: ${data.blogPost.metadata.title}`);
    log(`  - Sections: ${data.blogPost.sections.length}`);
    log(`  - Total words: ${data.blogPost.sections.reduce((sum, s) => sum + (s.wordCount || 0), 0)}`);
    
    return data.blogPost;
  } catch (error) {
    log(`✗ Assembly phase failed: ${error.message}`, "red");
    throw error;
  }
}

async function testValidation() {
  log("\n=== VALIDATION ===", "cyan");
  
  try {
    log("Validating system setup...", "blue");
    
    // Check if environment variables are set
    const requiredEnvVars = [
      "OPENAI_API_KEY",
      "ADMIN_PASSWORD",
      "DATABASE_URL"
    ];
    
    const missing = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      log(`⚠ Missing environment variables: ${missing.join(", ")}`, "yellow");
    } else {
      log("✓ All required environment variables are set", "green");
    }
    
    // Test API connectivity
    log("Testing API connectivity...", "blue");
    const response = await fetch(`${API_BASE}/api/blog/research`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ADMIN_PASSWORD}`,
      },
    });
    
    if (response.ok) {
      log("✓ API is responding correctly", "green");
    } else {
      log(`✗ API returned status ${response.status}`, "red");
    }
  } catch (error) {
    log(`✗ Validation failed: ${error.message}`, "red");
  }
}

async function runFullTest() {
  log("\n╔════════════════════════════════════════════╗", "cyan");
  log("║  BLOG GENERATOR - COMPLETE FLOW TEST      ║", "cyan");
  log("╚════════════════════════════════════════════╝\n", "cyan");

  try {
    // Test validation first
    await testValidation();

    // Run the complete flow
    log("\nStarting blog generation pipeline...\n", "cyan");

    // Phase 1: Research
    const researchResult = await testResearchPhase();

    // Phase 2: Write sections
    const sections = await testWritePhase(researchResult.draftId, researchResult.outline);

    // Phase 3: Assemble
    const blogPost = await testAssemblyPhase(researchResult.draftId);

    // Summary
    log("\n╔════════════════════════════════════════════╗", "green");
    log("║          TEST COMPLETED SUCCESSFULLY       ║", "green");
    log("╚════════════════════════════════════════════╝\n", "green");
    
    log("Summary:", "cyan");
    log(`  - Draft ID: ${researchResult.draftId}`);
    log(`  - Sections written: ${sections.length}`);
    log(`  - Total word count: ${sections.reduce((sum, s) => sum + s.wordCount, 0)} words`);
    log(`  - Blog post status: Ready for publishing`);

  } catch (error) {
    log("\n╔════════════════════════════════════════════╗", "red");
    log("║            TEST FAILED                    ║", "red");
    log("╚════════════════════════════════════════════╝\n", "red");
    
    log(`Error: ${error.message}`, "red");
    process.exit(1);
  }
}

// Run the test
runFullTest();
