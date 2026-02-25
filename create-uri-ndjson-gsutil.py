#!/usr/bin/env python3
"""Create URI-based NDJSON by manually uploading content"""

import json
import subprocess
import os

with open('/Users/marcusbinnie/jt-physio/shoulder-chunks.ndjson', 'r') as f:
    docs = [json.loads(line) for line in f if line.strip()]

print(f'Processing {len(docs)} documents\n')

bucket = 'gs://jt-physio-documents'
transformed = []

for doc in docs:
    doc_id = doc['id']
    content_text = doc['structData'].get('content', '')
    
    # Save content to temp file
    temp_file = f'/tmp/{doc_id}.txt'
    with open(temp_file, 'w') as f:
        f.write(content_text)
    
    # Upload to GCS using gsutil
    gcs_path = f'{bucket}/chunk-content/{doc_id}.txt'
    result = subprocess.run(['gsutil', 'cp', temp_file, gcs_path], 
                          capture_output=True, text=True)
    if result.returncode == 0:
        print(f'  ⬆️  {doc_id}.txt')
    else:
        print(f'  ❌ Failed to upload {doc_id}.txt')
    
    os.remove(temp_file)
    
    # Create document with URI reference
    new_doc = {
        'id': doc_id,
        'content': {
            'mimeType': 'text/plain',
            'uri': f'{bucket}/chunk-content/{doc_id}.txt'
        },
        'structData': {k: v for k, v in doc['structData'].items() if k != 'content'}
    }
    transformed.append(new_doc)

# Write NDJSON
output_file = '/Users/marcusbinnie/jt-physio/shoulder-chunks-uri.ndjson'
with open(output_file, 'w') as f:
    for doc in transformed:
        f.write(json.dumps(doc) + '\n')

print(f'\n✅ Created {output_file}')
with open(output_file, 'r') as f:
    first = json.loads(f.readline())
    print(f'✓ Content uses URI: {first["content"]["uri"]}')
    print(f'✓ structData preserved: {list(first["structData"].keys())[:3]}...')
