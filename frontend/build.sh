#!/bin/bash
set -e

echo "Starting build process..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next

# Install dependencies
echo "Installing dependencies..."
npm install

# Install sharp for Linux
echo "Installing sharp for Linux..."
npm install --platform=linux --arch=x64 sharp

# Set environment variables
echo "Setting environment variables..."
export NEXT_DISABLE_IMAGE_OPTIMIZATION=true
export NODE_ENV=production

# Run the build
echo "Running Next.js build..."
if ! npm run vercel-build; then
    echo "Next.js build failed with exit code $?"
    exit 1
fi

# Verify build output
echo "Verifying build output..."
if [ ! -d ".next" ]; then
    echo "Error: .next directory not found"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

echo "Checking .next directory contents..."
ls -la .next

if [ ! -f ".next/routes-manifest.json" ]; then
    echo "Error: routes-manifest.json not found"
    echo "Contents of .next directory:"
    ls -la .next
    echo "Checking for build output files..."
    find .next -type f -name "*.json"
    exit 1
fi

echo "Build completed successfully"
exit 0 