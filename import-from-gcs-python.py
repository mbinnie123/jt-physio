#!/usr/bin/env python3

"""
Import unstructured data from GCS to Vertex Data Store using Python SDK

Uploads documents from Google Cloud Storage bucket to Vertex AI Data Store
for better control and support of unstructured document imports.

Usage:
    python3 import-from-gcs-python.py shoulder-chunks-1771892033205.ndjson
    python3 import-from-gcs-python.py --help
"""

import os
import sys
import argparse
from datetime import datetime
from google.cloud import discoveryengine_v1

def get_project_id():
    """Get GCP project ID from environment"""
    project_id = os.getenv('GCP_PROJECT_ID')
    if not project_id:
        raise ValueError('GCP_PROJECT_ID environment variable not set')
    return project_id

def get_data_store_id():
    """Get Vertex Data Store ID from environment"""
    data_store_id = os.getenv('VERTEX_DATA_STORE_ID')
    if not data_store_id:
        raise ValueError('VERTEX_DATA_STORE_ID environment variable not set')
    return data_store_id

def get_location():
    """Get GCP location from environment"""
    return os.getenv('GCP_LOCATION', 'global')

def import_documents_from_gcs(file_pattern: str):
    """
    Import documents from GCS to Vertex Data Store
    
    Args:
        file_pattern: GCS file pattern (e.g., 'shoulder-chunks-*.ndjson')
    """
    
    project_id = get_project_id()
    data_store_id = get_data_store_id()
    location = get_location()
    bucket_name = 'jt-physio-documents'
    
    print('🔄 Importing from Google Cloud Storage\n')
    print(f'📍 Project: {project_id}')
    print(f'📚 Data Store: {data_store_id}')
    print(f'🌍 Location: {location}\n')
    
    # Create client
    client = discoveryengine_v1.DocumentServiceClient()
    
    # Build resource names
    parent = client.branch_path(
        project=project_id,
        location=location,
        data_store=data_store_id,
        branch='default_branch'
    )
    
    print(f'📤 Importing documents from GCS...')
    print(f'   Bucket: gs://{bucket_name}/')
    print(f'   Pattern: {file_pattern}')
    print(f'   Error logs: gs://{bucket_name}/import-errors/\n')
    
    # Create import documents request with proper schema
    # For unstructured documents with metadata in structData:
    gcs_source = discoveryengine_v1.GcsSource(
        input_uris=[f'gs://{bucket_name}/{file_pattern}']
    )
    
    error_config = discoveryengine_v1.ImportErrorConfig(
        gcs_prefix=f'gs://{bucket_name}/import-errors/'
    )
    
    request = discoveryengine_v1.ImportDocumentsRequest(
        parent=parent,
        gcs_source=gcs_source,
        error_config=error_config,
        reconciliation_mode=discoveryengine_v1.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL
    )
    
    try:
        # Import documents
        operation = client.import_documents(request=request)
        
        print('✅ Import initiated successfully!')
        print(f'   Operation: {operation.operation.name}\n')
        print('📋 Timeline:')
        print('   1. Documents queued for import: ✅')
        print('   2. Processing in background: 5-10 minutes')
        print('   3. Indexing: 10-30 minutes')
        print('   4. Available for search: ~2-4 hours')
        
        # Wait for operation to complete (optional)
        # Uncomment to wait for completion
        # print('\n⏳ Waiting for import to complete...')
        # result = operation.result(timeout=3600)
        # print(f'Operation completed: {result}')
        
        return operation
        
    except Exception as e:
        print(f'❌ Import failed: {str(e)}')
        if hasattr(e, 'details'):
            print(f'   Details: {e.details()}')
        sys.exit(1)

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Import unstructured data from GCS to Vertex Data Store',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python3 import-from-gcs-python.py shoulder-chunks-1771892033205.ndjson
  python3 import-from-gcs-python.py shoulder-chunks-*.ndjson
        '''
    )
    
    parser.add_argument(
        'file_pattern',
        nargs='?',
        default='shoulder-chunks-*.ndjson',
        help='GCS file pattern to import (default: shoulder-chunks-*.ndjson)'
    )
    
    args = parser.parse_args()
    
    # Load environment variables from .env.local
    from dotenv import load_dotenv
    load_dotenv('.env.local')
    
    import_documents_from_gcs(args.file_pattern)

if __name__ == '__main__':
    main()
