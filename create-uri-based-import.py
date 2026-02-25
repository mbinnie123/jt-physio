#!/usr/bin/env python3
"""Upload chunk content to GCS and create NDJSON with URI references"""

import json
from google.cloud import storage

project_id = 'jt-football-physiotherapy'
bucket_name = 'jt-physio-documents'

with open('/Users/marcusbinnie/jt-physio/shoulder-chunks.ndjson', 'r') as f:
    docs = [json.loads(line) for line in f if line.strip()]

print(f'Processing {len(docs)} documents')

storage_client = storage.Client(project=project_id)
bucket = storage_client.bucket(bucket_name)

transformed = []
for doc in docs:
    doc_id = doc['id']
    content_text = doc['structData'].get('content', '')
    
    # Upload content to GCS
    content_filename = f'chunk-content/{doc_id}.txt'
    blob = bucket.blob(content_filename)
    blob.upload_from_string(content_text, content_type='text/plain')
    print(f'  ⬆️  {content_filename}')
    
    # Create document with URI reference
    new_doc = {
        'id': doc_id,
        'content': {
            'mimeType': 'text/plain',
            'uri': f'gs://{bucket_name}/{content_filename}'
        },
        'structData': {k: v for k, v in doc['structData'].items() if k != 'content'}
    }
    transformed.append(new_doc)

# Write NDJSON with URI references
output_file = '/Users/marcusbinnie/jt-physio/shoulder-chunks-uri.ndjson'
with open(output_file, 'w') as f:
    for doc in transformed:
        f.write(json.dumps(doc) + '\n')

print(f'\n✅ Created {output_file} with URI references')
with open(output_file, 'r') as f:
    first = json.loads(f.readline())
    print(f'✓ Content uses URI: {first["content"]["uri"]}')
