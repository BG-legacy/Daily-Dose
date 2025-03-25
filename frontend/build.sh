#!/bin/bash

# Don't exit immediately on error, we want to see what's happening
set +e

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

# Run the build with debugging
echo "Running Next.js build..."
npm run vercel-build
BUILD_EXIT_CODE=$?

echo "Build process exited with code: $BUILD_EXIT_CODE"

# Check .next directory immediately after build
echo "Checking build output directory..."
if [ -d ".next" ]; then
    echo ".next directory exists"
    echo "Contents of .next:"
    ls -la .next
    
    # Check for critical build files
    if [ -f ".next/routes-manifest.json" ] && [ -f ".next/build-manifest.json" ]; then
        echo "Found required build files"
        echo "Build manifest contents:"
        cat .next/build-manifest.json | head -n 20
        echo "Routes manifest contents:"
        cat .next/routes-manifest.json | head -n 20
        
        # If we have the required files, consider this a success
        echo "Build completed successfully with required artifacts"
        exit 0
    else
        echo "Error: Missing required build files"
        echo "Looking for JSON files in .next:"
        find .next -type f -name "*.json"
    fi
else
    echo "Error: .next directory not found after build"
    echo "Current directory contents:"
    ls -la
fi

# If we get here, something went wrong
echo "Build verification failed"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current working directory: $(pwd)"

exit 1 