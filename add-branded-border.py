#!/usr/bin/env python3
"""Add branded borders to images and make them the same size."""

from PIL import Image
import os

# Brand color from tailwind config
BRAND_COLOR = "#002A4E"
BORDER_WIDTH = 50  # pixels (thicker border for visibility)
IMAGE_DIR = "/Users/marcusd.binnie/jt-physio/public"

image_files = [
    "physiotherapy-clinic-kilmarnock-1.jpeg",
    "physiotherapy-clinic-kilmarnock-2.jpeg"
]

# Load both images
images = {}
for filename in image_files:
    path = os.path.join(IMAGE_DIR, filename)
    images[filename] = Image.open(path)
    print(f"Loaded {filename}: {images[filename].size}")

# Get max dimensions to ensure both fit
img1 = images[image_files[0]]
img2 = images[image_files[1]]
max_width = max(img1.width, img2.width)
max_height = max(img1.height, img2.height)

print(f"\nTarget image size (before border): {max_width}x{max_height}")

# Process each image
for filename in image_files:
    img = images[filename]
    
    # Resize to match max dimensions
    if img.size != (max_width, max_height):
        img = img.resize((max_width, max_height), Image.Resampling.LANCZOS)
        print(f"Resized {filename} to {max_width}x{max_height}")
    
    # Add branded border
    bordered_size = (max_width + 2 * BORDER_WIDTH, max_height + 2 * BORDER_WIDTH)
    bordered_img = Image.new("RGB", bordered_size, BRAND_COLOR)
    bordered_img.paste(img, (BORDER_WIDTH, BORDER_WIDTH))
    
    # Save back
    output_path = os.path.join(IMAGE_DIR, filename)
    bordered_img.save(output_path, quality=95)
    print(f"Saved {filename} with border: {bordered_size}")

print(f"\n✓ Both images now {max_width + 2*BORDER_WIDTH}x{max_height + 2*BORDER_WIDTH} with {BORDER_WIDTH}px branded border")
