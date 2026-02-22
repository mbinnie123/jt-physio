#!/bin/bash

# Import shoulder URLs to Vertex Data Store using gcloud and REST API
# Prerequisites: gcloud CLI configured with your GCP project

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-jt-physio-441316}
DATA_STORE_ID=${VERTEX_DATA_STORE_ID:-blog-research-index_1771434940842}
LOCATION=${GCP_LOCATION:-global}

echo "🔐 Authenticating with gcloud..."
ACCESS_TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Could not get access token. Run: gcloud auth application-default login"
  exit 1
fi

echo "✅ Authenticated as: $(gcloud config get-value account)"
echo ""

# Read CSV and prepare documents
echo "📄 Reading shoulder-urls.csv..."
CSV_FILE="./shoulder-urls.csv"

if [ ! -f "$CSV_FILE" ]; then
  echo "❌ $CSV_FILE not found"
  exit 1
fi

# Create JSON payload from CSV
echo "📋 Preparing import payload..."

# Parse CSV into JSON documents
DOCS_JSON="[]"
LINE_NUM=0
while IFS= read -r line; do
  if [ $LINE_NUM -eq 0 ]; then
    ((LINE_NUM++))
    continue  # Skip header
  fi
  
  # Parse CSV line
  URL=$(echo "$line" | cut -d'"' -f2)
  TITLE=$(echo "$line" | cut -d'"' -f4)
  TOPIC=$(echo "$line" | cut -d'"' -f6)
  CONTENT_TYPE=$(echo "$line" | cut -d'"' -f8)
  
  echo "   ✓ $TITLE"
  
  # Build document JSON
  DOC_JSON=$(cat <<EOF
{
  "id": "shoulder-url-$((LINE_NUM))",
  "jsonData": "{\"title\":\"$TITLE\",\"url\":\"$URL\",\"topic\":\"$TOPIC\",\"content_type\":\"$CONTENT_TYPE\"}"
}
EOF
)
  
  ((LINE_NUM++))
done < "$CSV_FILE"

echo ""
echo "📤 Sending import request to Vertex Data Store..."
echo "   Project: $PROJECT_ID"
echo "   Data Store: $DATA_STORE_ID"
echo "   Location: $LOCATION"
echo ""

# API endpoint
ENDPOINT="https://discoveryengine.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/dataStores/${DATA_STORE_ID}/branches/default_branch/documents:import"

# Create payload
PAYLOAD=$(cat <<'EOF'
{
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
}
EOF
)

# Send request
RESPONSE=$(curl -s -X POST \
  "$ENDPOINT" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Import request sent!"
echo "⏳ Processing may take 5-10 minutes."
echo "📊 Check indexing status: https://console.cloud.google.com/discovery-engine/"
echo ""
