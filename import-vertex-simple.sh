#!/bin/bash

# Import shoulder URLs to Vertex Data Store using curl + service account
# No dependencies needed!

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-jt-physio-441316}
DATA_STORE_ID=${VERTEX_DATA_STORE_ID:-blog-research-index_1771434940842}
LOCATION=${GCP_LOCATION:-us-central1}  # Try specific region instead of global

SERVICE_ACCOUNT_FILE="./gcp-service-account.json"

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
  echo "❌ $SERVICE_ACCOUNT_FILE not found"
  exit 1
fi

echo "🔐 Extracting credentials..."
PRIVATE_KEY=$(jq -r '.private_key' "$SERVICE_ACCOUNT_FILE")
CLIENT_EMAIL=$(jq -r '.client_email' "$SERVICE_ACCOUNT_FILE")

# Create JWT
HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 -w 0 | tr '+/' '-_' | sed 's/=//g')

NOW=$(date +%s)
EXP=$((NOW + 3600))

PAYLOAD=$(echo -n "{\"iss\":\"$CLIENT_EMAIL\",\"scope\":\"https://www.googleapis.com/auth/cloud-platform\",\"aud\":\"https://oauth2.googleapis.com/token\",\"exp\":$EXP,\"iat\":$NOW}" | base64 -w 0 | tr '+/' '-_' | sed 's/=//g')

SIGNATURE=$(echo -n "$HEADER.$PAYLOAD" | openssl dgst -sha256 -sign <(echo "$PRIVATE_KEY") | base64 -w 0 | tr '+/' '-_' | sed 's/=//g')

JWT="$HEADER.$PAYLOAD.$SIGNATURE"

echo "🔑 Getting access token..."
TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$JWT" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Authentication successful\n"

echo "📋 Importing 5 shoulder exercise URLs..."
echo "   Project: $PROJECT_ID"
echo "   Data Store: $DATA_STORE_ID"
echo "   Location: $LOCATION\n"

# API endpoint
ENDPOINT="https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import"

# Create payload
PAYLOAD='{
  "inlineSource": {
    "documents": [
      {
        "id": "shoulder-url-1",
        "jsonData": "{\"title\":\"NHS AAA - Shoulder Exercises for Weak and Painful MSK\",\"url\":\"https://www.nhsaaa.net/musculoskeletal-msk-service-patient-portal/shoulder-msk-patient-portal/shoulder-exercises-weak-and-painful-msk-patient-portal/\",\"topic\":\"shoulder exercises\",\"content_type\":\"webpage\"}"
      },
      {
        "id": "shoulder-url-2",
        "jsonData": "{\"title\":\"BESS - Exercises for Shoulder Pain\",\"url\":\"https://bess.ac.uk/exercises-for-shoulder-pain/\",\"topic\":\"shoulder pain relief\",\"content_type\":\"webpage\"}"
      },
      {
        "id": "shoulder-url-3",
        "jsonData": "{\"title\":\"Surrey Physio - Top 5 Jo Gibson Shoulder Exercises\",\"url\":\"https://www.surreyphysio.co.uk/top-5/top-5-jo-gibson-shoulder-exercises/\",\"topic\":\"shoulder rehabilitation\",\"content_type\":\"webpage\"}"
      },
      {
        "id": "shoulder-url-4",
        "jsonData": "{\"title\":\"Cirencester Physiotherapy Centre - Shoulder Exercises for Athletes\",\"url\":\"https://www.cirencesterphysiotherapycentre.co.uk/component/k2/item/29-good-shoulder-exercises-for-athletes\",\"topic\":\"athletic shoulder care\",\"content_type\":\"webpage\"}"
      },
      {
        "id": "shoulder-url-5",
        "jsonData": "{\"title\":\"Dines Orthopedics - Mohamed Salah Shoulder Injury Recovery\",\"url\":\"https://dinesorthopedics.com/forbes-dont-worry-egypt-mohamed-salahs-shoulder-injury-shouldnt-keep-him-out-of-world-cup/\",\"topic\":\"professional athlete rehabilitation\",\"content_type\":\"webpage\"}"
      }
    ]
  }
}'

echo "📤 Sending import request...\n"

RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Import request sent!"
echo "⏳ Indexing may take 5-10 minutes."
echo "📊 Monitor status: https://console.cloud.google.com/discovery-engine/dataStores/$DATA_STORE_ID/indexing\n"
