#!/usr/bin/env python3
"""Transform to use uri-based content or remove content field entirely"""

import json

with open('shoulder-chunks.ndjson', 'r') as f:
    docs = [json.loads(line) for line in f if line.strip()]

print(f'📖 Processing {len(docs)} documents\n')

# Strategy: Keep everything in structData, no top-level content
transformed = []
for doc in docs:
    new_doc = {
        'id': doc['id'],
        'structData': doc['structData']  # Everything including content
    }
    transformed.append(new_doc)

output_file = 'shoulder-chunks-metadata-only.ndjson'
with open(output_file, 'w') as f:
    for doc in transformed:
        f.write(json.dumps(doc) + '\n')

print(f'✅ Created {output_file}')
with open(output_file, 'r') as f:
    first = json.loads(f.readline())
    print(f'\n✓ Top-level keys: {list(first.keys())}')
    print(f'✓ Content in structData: {"content" in first["structData"]}')
