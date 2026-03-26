#!/usr/bin/env python3
import requests
import json

admin_password = "JtPhysio_Admin_2026!9kP"
base_url = "http://localhost:3000"

# Fetch list of posts
print("=" * 60)
print("Fetching list of published posts...")
print("=" * 60)
response = requests.get(f"{base_url}/api/blog/wix-posts", 
    headers={'Authorization': admin_password})
print(f"Status: {response.status_code}")
data = response.json()
print(f"Posts count: {len(data.get('posts', []))}")

if data.get('posts'):
    first_post = data['posts'][0]
    print(f"\nFirst post ID: {first_post.get('id')}")
    print(f"First post title: {first_post.get('title')}")
    print(f"First post fields: {list(first_post.keys())}")
    print(f"Has 'content' field: {'content' in first_post}")
    print(f"Has 'richContent' field: {'richContent' in first_post}")
    
    # Now try to fetch details for that post
    post_id = first_post.get('id')
    print(f"\n{'=' * 60}")
    print(f"Fetching details for post: {post_id}")
    print(f"{'=' * 60}")
    
    details_response = requests.get(
        f"{base_url}/api/blog/wix-posts?action=details&postId={post_id}",
        headers={'Authorization': admin_password}
    )
    print(f"Status: {details_response.status_code}")
    details_data = details_response.json()
    
    if 'error' in details_data:
        print(f"Error: {details_data['error']}")
    elif 'post' in details_data:
        post = details_data['post']
        print(f"Post title: {post.get('title')}")
        print(f"Post fields: {list(post.keys())}")
        print(f"Has 'richContent' field: {'richContent' in post}")
        print(f"Has 'htmlBody' field: {'htmlBody' in post}")
        print(f"Has 'plainContent' field: {'plainContent' in post}")
        
        if post.get('richContent'):
            print(f"\nrichContent type: {type(post['richContent'])}")
            if isinstance(post['richContent'], dict):
                print(f"richContent keys: {list(post['richContent'].keys())}")
                print(f"Has 'nodes' field: {'nodes' in post['richContent']}")
