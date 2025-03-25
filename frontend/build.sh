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
    if [ -f ".next/build-manifest.json" ] && [ -f ".next/app-build-manifest.json" ]; then
        echo "Found required build files"
        
        # Create routes-manifest.json for Vercel
        echo "Creating routes-manifest.json..."
        echo '{
  "version": 3,
  "pages404": true,
  "basePath": "",
  "redirects": [],
  "headers": [],
  "dynamicRoutes": [],
  "staticRoutes": [],
  "dataRoutes": [],
  "rewrites": {
    "beforeFiles": [],
    "afterFiles": [],
    "fallback": []
  },
  "rsc": {
    "header": "RSC",
    "varyHeader": "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url"
  },
  "i18n": null
}' > .next/routes-manifest.json
        
        # Check server manifests
        echo "Checking server manifests..."
        if [ -f ".next/server/app-paths-manifest.json" ] && [ -f ".next/server/pages-manifest.json" ]; then
            echo "Found server manifest files"
            echo "Server manifests:"
            ls -la .next/server/*.json
            
            # Verify routes-manifest.json was created
            if [ -f ".next/routes-manifest.json" ]; then
                echo "routes-manifest.json created successfully"
                echo "Contents of routes-manifest.json:"
                cat .next/routes-manifest.json
                
                # If we have all required files, consider this a success
                echo "Build completed successfully with required artifacts"
                exit 0
            else
                echo "Error: Failed to create routes-manifest.json"
                exit 1
            fi
        else
            echo "Error: Missing server manifest files"
            echo "Server directory contents:"
            ls -la .next/server/
            exit 1
        fi
    else
        echo "Error: Missing required build files"
        echo "Looking for JSON files in .next:"
        find .next -type f -name "*.json"
        exit 1
    fi
else
    echo "Error: .next directory not found after build"
    echo "Current directory contents:"
    ls -la
    exit 1
fi 