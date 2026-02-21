#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
ADMIN_PASSWORD="JtPhysio_Admin_2026!9kP"

echo -e "${BLUE}🚀 Starting Blog Publishing Flow Test${NC}\n"

# Step 1: Create a draft using the research endpoint
echo -e "${BLUE}Step 1: Creating a draft via research endpoint...${NC}"
DRAFT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/research" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d '{
    "topic": "ACL Tear Recovery",
    "location": "Kilmarnock",
    "sport": "Football"
  }')

echo "Response: $DRAFT_RESPONSE"
DRAFT_ID=$(echo $DRAFT_RESPONSE | grep -o '"draftId":"[^"]*' | cut -d'"' -f4)

if [ -z "$DRAFT_ID" ]; then
  echo -e "${RED}❌ Failed to create draft${NC}"
  echo "Full response: $DRAFT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Draft created with ID: $DRAFT_ID${NC}\n"

# Step 2: Add a section
echo -e "${BLUE}Step 2: Adding sections...${NC}"
SECTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/write-section" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d "{
    \"draftId\": \"$DRAFT_ID\",
    \"sectionIndex\": 0,
    \"sectionTitle\": \"What is an ACL Tear?\",
    \"content\": \"The anterior cruciate ligament (ACL) is one of the major ligaments in the knee. An ACL tear is a common sports injury that can affect athletes in high-impact activities like football, basketball, and skiing.\"
  }")

echo "Response: $SECTION_RESPONSE"
echo -e "${GREEN}✅ Section added${NC}\n"

# Step 3: Publish the draft
echo -e "${BLUE}Step 3: Publishing draft...${NC}"
PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d "{
    \"draftId\": \"$DRAFT_ID\"
  }")

echo "Response: $PUBLISH_RESPONSE"

# Check if publish was successful
if echo "$PUBLISH_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Publishing successful!${NC}"
else
  echo -e "${RED}❌ Publishing failed${NC}"
fi

echo -e "\n${BLUE}📊 Test Complete${NC}"
echo "Draft ID: $DRAFT_ID"
