#!/bin/bash

# Create PNG icons from SVG for better PWA compatibility
# This requires ImageMagick to be installed: brew install imagemagick

cd "$(dirname "$0")"

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "Please install ImageMagick manually or use Homebrew"
        exit 1
    fi
fi

# Create 192x192 PNG from SVG
if [ -f "icon-512x512.svg" ]; then
    convert icon-512x512.svg -resize 192x192 icon-192x192.png
    echo "Created icon-192x192.png from 512x512 SVG"
elif [ -f "icon-192x192.svg" ]; then
    convert icon-192x192.svg -resize 192x192 icon-192x192.png
    echo "Created icon-192x192.png from 192x192 SVG"
else
    echo "Error: No SVG icon found to generate 192x192 PNG"
    exit 1
fi

# Create 512x512 PNG from SVG  
if [ -f "icon-512x512.svg" ]; then
    convert icon-512x512.svg -resize 512x512 icon-512x512.png
    echo "Created icon-512x512.png"
else
    echo "Error: icon-512x512.svg not found"
    exit 1
fi

# Create favicon
if [ -f "icon-512x512.svg" ]; then
    convert icon-512x512.svg -resize 32x32 favicon.ico
    echo "Created favicon.ico"
elif [ -f "icon-192x192.svg" ]; then
    convert icon-192x192.svg -resize 32x32 favicon.ico
    echo "Created favicon.ico"
else
    echo "Error: No SVG icon found to generate favicon"
    exit 1
fi

echo "All icons generated successfully!"
