#!/usr/bin/env node

/**
 * Wix API 404 Error Diagnostic Tool
 * 
 * Helps identify why Wix publishing is failing with 404 errors
 */

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  log("\n" + "=".repeat(70), "cyan");
  log(`  ${title}`, "bold");
  log("=".repeat(70), "cyan");
}

console.clear();

log("\n╔════════════════════════════════════════════════════════════════╗", "cyan");
log("║         WIX API 404 ERROR - DIAGNOSTIC REPORT                 ║", "cyan");
log("╚════════════════════════════════════════════════════════════════╝\n", "cyan");

// ============================================================================
// CHECK ENVIRONMENT VARIABLES
// ============================================================================
section("STEP 1: VERIFY WIX CREDENTIALS");

const credentials = {
  WIX_API_KEY: process.env.WIX_API_KEY,
  WIX_SITE_ID: process.env.WIX_SITE_ID,
  WIX_AUTHOR_MEMBER_ID: process.env.WIX_AUTHOR_MEMBER_ID,
  WIX_ACCOUNT_ID: process.env.WIX_ACCOUNT_ID,
};

log("\nCredentials Status:", "blue");
Object.entries(credentials).forEach(([key, value]) => {
  if (value) {
    const preview = value.substring(0, 20) + "..." + value.substring(value.length - 10);
    log(`  ✓ ${key} is SET`, "green");
    log(`    Value: ${preview}`, "yellow");
  } else {
    log(`  ✗ ${key} is MISSING`, "red");
  }
});

// ============================================================================
// DIAGNOSE 404 ERROR
// ============================================================================
section("STEP 2: 404 ERROR CAUSES");

const causes = [
  {
    cause: "Invalid WIX_SITE_ID",
    check: "The site ID doesn't match your Wix account",
    fix: "Verify WIX_SITE_ID in .env.local matches your Wix site",
    severity: "HIGH",
  },
  {
    cause: "Invalid WIX_API_KEY",
    check: "API key is expired, revoked, or malformed",
    fix: "Generate a new API key from Wix Dashboard",
    severity: "HIGH",
  },
  {
    cause: "Wrong Wix API Endpoint",
    check: "Using /blog/v3/posts but API expects different path",
    fix: "Verify endpoint with: https://dev.wix.com/docs/rest/blog",
    severity: "HIGH",
  },
  {
    cause: "Missing API Permissions",
    check: "API key doesn't have 'blog:write' permission",
    fix: "Grant blog.posts.write permission to API key",
    severity: "CRITICAL",
  },
  {
    cause: "Incorrect Request Headers",
    check: 'Missing or malformed "wix-site-id" header',
    fix: 'Ensure header includes: "wix-site-id: {WIX_SITE_ID}"',
    severity: "MEDIUM",
  },
  {
    cause: "Blog App Not Installed",
    check: "Wix Blog app is not installed on your site",
    fix: "Install Wix Blog app from Wix App Market",
    severity: "CRITICAL",
  },
];

log("\nCommon 404 Causes:", "blue");
causes.forEach((item, i) => {
  log(`\n${i + 1}. ${item.cause} [${item.severity}]`, "red");
  log(`   Check: ${item.check}`, "yellow");
  log(`   Fix  : ${item.fix}`, "green");
});

// ============================================================================
// STEP-BY-STEP TROUBLESHOOTING
// ============================================================================
section("STEP 3: TROUBLESHOOTING CHECKLIST");

const checklist = [
  {
    step: "1",
    task: "Verify Wix Blog App Installation",
    action:
      "Go to: https://www.wix.com/apps/install → Search 'Blog' → Ensure it's installed",
    impact: "If not installed, API will return 404",
  },
  {
    step: "2",
    task: "Check API Key Permissions",
    action:
      "Go to: Wix Dashboard → Settings → API & Extensions → Verify 'blog.posts.write' permission",
    impact: "Missing permission causes 404",
  },
  {
    step: "3",
    task: "Verify Site ID",
    action:
      "Go to: Wix Dashboard → Settings → General → Copy 'Site ID' and verify it matches WIX_SITE_ID",
    impact: "Wrong site ID will always return 404",
  },
  {
    step: "4",
    task: "Test API Endpoint",
    action:
      "Run: curl -X POST https://www.wixapis.com/blog/v3/posts -H 'Authorization: Bearer {WIX_API_KEY}' -H 'wix-site-id: {WIX_SITE_ID}'",
    impact: "Will show exact error if credentials are wrong",
  },
  {
    step: "5",
    task: "Check API Key Format",
    action: "Ensure API key starts with 'IST.eyJ...' (JWT format)",
    impact: "Malformed key will cause authentication errors",
  },
];

log("\n", "reset");
checklist.forEach((item) => {
  log(`Step ${item.step}: ${colors.bold}${item.task}${colors.reset}`, "blue");
  log(`         Action  : ${item.action}`, "yellow");
  log(`         Impact  : ${item.impact}`, "cyan");
  log("");
});

// ============================================================================
// QUICK FIX GUIDE
// ============================================================================
section("STEP 4: QUICK FIX OPTIONS");

log("\n🔧 Option 1: Regenerate API Key", "green");
log("   1. Go to: https://www.wix.com/dashboard");
log("   2. Settings → Integrations → API → Create Key");
log("   3. Grant: blog.posts.write, blog.posts.read");
log("   4. Copy entire key");
log("   5. Update WIX_API_KEY in .env.local");
log("   6. Restart server: npm run dev");

log("\n🔧 Option 2: Verify Correct Site ID", "green");
log("   1. Go to: https://www.wix.com/dashboard");
log("   2. Settings → General → Copy 'Site ID'");
log("   3. Update WIX_SITE_ID in .env.local");
log("   4. Make sure IDs match exactly (copy-paste, not typed)");
log("   5. Restart server: npm run dev");

log("\n🔧 Option 3: Install/Enable Blog App", "green");
log("   1. Go to: https://www.wix.com/apps");
log("   2. Search: 'Blog'");
log("   3. Click 'Install'");
log("   4. Wait 2-3 minutes for app to activate");
log("   5. Try publishing again");

log("\n🔧 Option 4: Test with cURL", "green");
log("   Run this command to test your API key:");
log("");
log('   curl -X GET https://www.wixapis.com/v1/blog/posts \\');
log('     -H "Authorization: Bearer {WIX_API_KEY}" \\');
log('     -H "wix-site-id: {WIX_SITE_ID}"');
log("");
log("   If this works, your credentials are correct.");
log("   If it returns 404, there's an issue with credentials.");

// ============================================================================
// API ENDPOINT VALIDATION
// ============================================================================
section("STEP 5: API ENDPOINT DETAILS");

const apiInfo = {
  "Base URL": "https://www.wixapis.com",
  "Create Post": "POST /blog/v3/posts",
  "Update Post": "PATCH /blog/v3/posts/{postId}",
  "Get Posts": "GET /blog/v3/posts",
  "Auth Header": "Authorization: Bearer {WIX_API_KEY}",
  "Site Header": "wix-site-id: {WIX_SITE_ID}",
};

log("\nWix Blog API v3 Details:", "blue");
Object.entries(apiInfo).forEach(([key, value]) => {
  log(`  ${key.padEnd(20)} : ${value}`, "yellow");
});

// ============================================================================
// ERROR RESPONSE EXAMPLES
// ============================================================================
section("STEP 6: UNDERSTAND ERROR RESPONSES");

log("\n404 - Not Found", "red");
log('  Cause: Endpoint doesn\'t exist OR Blog app not installed', "yellow");
log("  Solution: Install Blog app, verify endpoint URL", "green");

log("\n401 - Unauthorized", "red");
log("  Cause: Invalid API key or expired", "yellow");
log("  Solution: Regenerate API key from Wix Dashboard", "green");

log("\n403 - Forbidden", "red");
log("  Cause: API key lacks required permissions", "yellow");
log("  Solution: Grant blog.posts.write permission", "green");

log("\n400 - Bad Request", "red");
log("  Cause: Invalid request body or headers", "yellow");
log("  Solution: Check request structure and headers", "green");

// ============================================================================
// VERIFICATION SCRIPT
// ============================================================================
section("STEP 7: AUTOMATIC VERIFICATION");

log("\nTo verify your setup, create a test file: test-wix-credentials.js", "blue");
log("\nThen run: node test-wix-credentials.js\n", "yellow");

// ============================================================================
// SUMMARY
// ============================================================================
log("\n╔════════════════════════════════════════════════════════════════╗", "cyan");
log("║                   DIAGNOSTIC SUMMARY                          ║", "cyan");
log("╚════════════════════════════════════════════════════════════════╝\n", "cyan");

log("Most Common Solution for 404:", "bold");
log("→ Go to Wix Dashboard → Install Blog app → Wait 2-3 minutes\n", "yellow");

log("Next Steps:", "cyan");
log("1. Follow the Quick Fix Guide above", "blue");
log("2. Update .env.local with correct credentials", "blue");
log("3. Run: npm run dev", "blue");
log("4. Try publishing again", "blue");
log("5. Check terminal logs for [Wix] messages", "blue");

log("\nFor more help:", "cyan");
log("→ Wix Developer Docs: https://dev.wix.com/docs/rest/blog", "yellow");
log("→ Wix API Keys: https://www.wix.com/dashboard", "yellow");
log("→ Check your .env.local file exists and has correct values\n", "yellow");
