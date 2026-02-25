#!/usr/bin/env python3
"""Transform shoulder-chunks.ndjson to add required content field for Vertex import"""

import json

# Read the local file
with open('shoulder-chunks.ndjson', 'r') as f:
    docs = [json.loads(line) for line in f if line.strip()]

print(f'📖 Processing {len(docs)} documents\n')

# Transform each document to add proper content field
transformed = []
for doc in docs:
    new_doc = {
        'id': doc['id'],
        # Add content field required by CONTENT_REQUIRED data stores
        'content': {
            'mimeType': 'text/plain',
            'rawText': doc['structData'].get('content', ''),  # Get content text
        },
        'structData': {k: v for k, v in doc['structData'].items() if k != 'content'}
    }
    transformed.append(new_doc)

# Write transformed file
output_file = 'shoulder-chunks-fixed.ndjson'
with open(output_file, 'w') as f:
    for doc in transformed:
        f.write(json.dumps(doc) + '\n')

print(f'✅ Generated {output_file} with proper content field')
print(f'\n📝 Document structure:')
print(f'   - id: document identifier')
print(f'   - content: {{mimeType, rawText}} with actual content')
print(f'   - structData: metadata fields')

# Verify
with open(output_file, 'r') as f:
    first = json.loads(f.readline())
    print(f'\n✓ Top-level keys: {list(first.keys())}')
    print(f'✓ Content mimeType: {first["content"]["mimeType"]}')
    print(f'✓ Content has text: {len(first["content"]["rawText"]) > 0}')
    print(f'✓ structData keys: {list(first["structData"].keys())}')
