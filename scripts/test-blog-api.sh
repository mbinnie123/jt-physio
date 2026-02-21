#!/bin/bash

# Blog Automation Quick Start Script
# This script demonstrates how to use the API endpoints

API_BASE="http://localhost:3000/api"
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"JtPhysio_Admin_2026!9kP"}
AUTH_HEADER="Bearer $ADMIN_PASSWORD"

echo "🚀 Blog Automation Generator - API Test"
echo "========================================"
echo ""

# Step 1: Conduct Research
echo "1️⃣  Conducting Research..."
TOPIC="Benefits of Regular Physiotherapy for Neck Pain"

RESEARCH_RESPONSE=$(curl -s -X POST "$API_BASE/blog/research" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"topic\": \"$TOPIC\"}")

echo "Research Response:"
echo "$RESEARCH_RESPONSE" | jq .

# Extract draft ID
DRAFT_ID=$(echo "$RESEARCH_RESPONSE" | jq -r '.draft.id')
echo ""
echo "Draft ID: $DRAFT_ID"
echo ""

# Step 2: Generate Outline
echo "2️⃣  Generating Outline..."
OUTLINE_RESPONSE=$(curl -s -X GET "$API_BASE/blog/write-section?draftId=$DRAFT_ID&action=generateOutline" \
  -H "Authorization: $AUTH_HEADER")

echo "Generated Outline:"
echo "$OUTLINE_RESPONSE" | jq '.outline'
echo ""

# Step 3: Write First Section
echo "3️⃣  Writing First Section..."
WRITE_RESPONSE=$(curl -s -X POST "$API_BASE/blog/write-section" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{
    \"draftId\": \"$DRAFT_ID\",
    \"sectionTitle\": \"Introduction to Neck Pain\",
    \"sectionNumber\": 1,
    \"tone\": \"professional\",
    \"targetAudience\": \"physiotherapy patients\"
  }")

echo "Section Response:"
echo "$WRITE_RESPONSE" | jq '.section'
echo ""

# Step 4: Assemble Blog Post
echo "4️⃣  Assembling Blog Post..."
ASSEMBLE_RESPONSE=$(curl -s -X POST "$API_BASE/blog/publish" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"draftId\": \"$DRAFT_ID\"}")

echo "Assembly Response:"
echo "$ASSEMBLE_RESPONSE" | jq '.blogPost | {title, slug, description}'
echo ""

# Step 5: Publish to Wix
echo "5️⃣  Publishing to Wix..."
PUBLISH_RESPONSE=$(curl -s -X POST "$API_BASE/blog/publish" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"draftId\": \"$DRAFT_ID\"}")

echo "Publish Response:"
echo "$PUBLISH_RESPONSE" | jq .
echo ""

echo "✅ Blog Creation Complete!"
