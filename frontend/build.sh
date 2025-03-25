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

# If build failed, show more information
if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "Next.js build failed with exit code $BUILD_EXIT_CODE"
    echo "Current directory contents:"
    ls -la
    echo "Node version:"
    node --version
    echo "NPM version:"
    npm --version
    exit $BUILD_EXIT_CODE
fi

echo "Next.js build completed successfully"

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

# Show final directory state
echo "Final .next directory contents:"
ls -la .next

exit 0 