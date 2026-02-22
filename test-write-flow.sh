#!/bin/bash
# Test the complete blog writing flow

ADMIN_PASSWORD=$(grep ADMIN_PASSWORD /Users/marcusbinnie/jt-physio/.env.local | cut -d= -f2)
BASE_URL="http://localhost:3000"

echo "===== Testing Blog Writing Flow ====="

# 1. Create a new draft
echo -e "\n1. Creating new draft..."
DRAFT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/draft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d '{"topic": "Test Topic for Writing"}')

DRAFT_ID=$(echo $DRAFT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created draft ID: $DRAFT_ID"
echo "Response: $DRAFT_RESPONSE" | head -c 200

# 2. Try to write a section WITHOUT research data first
echo -e "\n\n2. Attempting to write section without research data..."
WRITE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/write-section" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d "{
    \"draftId\": \"$DRAFT_ID\",
    \"sectionTitle\": \"Introduction\",
    \"sectionIndex\": 0,
    \"content\": \"This is a test\"
  }")

echo "Response: $WRITE_RESPONSE"

# 3. Now run research
echo -e "\n\n3. Running research..."
RESEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/blog/research" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d "{\"draftId\": \"$DRAFT_ID\"}")

echo "Research status: $(echo $RESEARCH_RESPONSE | grep -o '"success":[^,]*')"

# 4. Try writing section again
echo -e "\n\n4. Writing section after research..."
WRITE_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/blog/write-section" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_PASSWORD" \
  -d "{
    \"draftId\": \"$DRAFT_ID\",
    \"sectionTitle\": \"Main Content\",
    \"sectionIndex\": 1,
    \"content\": \"This is main content\"
  }")

echo "Success: $(echo $WRITE_RESPONSE2 | grep -o '"success":[^,]*')"
echo "Section title: $(echo $WRITE_RESPONSE2 | grep -o '"title":"[^"]*' | cut -d'"' -f4 | head -1)"
