#!/bin/bash
set -e

# Clean previous build
rm -rf .next

# Install dependencies
npm install

# Install sharp for Linux
npm install --platform=linux --arch=x64 sharp

# Set environment variables
export NEXT_DISABLE_IMAGE_OPTIMIZATION=true
export NODE_ENV=production

# Run the build
npm run vercel-build

# Verify build output
if [ ! -f ".next/routes-manifest.json" ]; then
    echo "Build failed: routes-manifest.json not found"
    exit 1
fi

# List build output for debugging
ls -la .next

# Exit with success
exit 0 