#!/usr/bin/env python3
"""Transform to metadata-only approach"""

import json

with open('/Users/marcusbinnie/jt-physio/shoulder-chunks.ndjson', 'r') as f:
    docs = [json.loads(line) for line in f if line.strip()]

print(f'Processing {len(docs)} documents')

# Keep everything in structData only  
transformed = []
for doc in docs:
    new_doc = {
        'id': doc['id'],
        'structData': doc['structData']
    }
    transformed.append(new_doc)

output_file = '/Users/marcusbinnie/jt-physio/shoulder-chunks-metadata-only.ndjson'
with open(output_file, 'w') as f:
    for doc in transformed:
        f.write(json.dumps(doc) + '\n')

print(f'Created {output_file}')
with open(output_file, 'r') as f:
    first = json.loads(f.readline())
    print(f'Top-level keys: {list(first.keys())}')
