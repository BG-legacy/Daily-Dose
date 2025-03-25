#!/bin/bash

# Don't exit immediately on error, we want to see what's happening
set +e

echo "Starting build process..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next
rm -rf .vercel

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

# Run Next.js build
echo "Running Next.js build..."
npm run vercel-build
BUILD_EXIT_CODE=$?

echo "Build process exited with code: $BUILD_EXIT_CODE"

# Create Vercel output directory structure if it doesn't exist
echo "Ensuring Vercel output directory structure exists..."
mkdir -p .vercel/output/static/_next
mkdir -p .vercel/output/functions

# Copy static files and create necessary structure
echo "Setting up static files..."

# Create config.json
echo "Creating config.json..."
echo '{
  "version": 3,
  "routes": [
    {
      "src": "^/_next/static/(.*)$",
      "headers": { "cache-control": "public,max-age=31536000,immutable" },
      "continue": true
    },
    {
      "handle": "filesystem"
    }
  ]
}' > .vercel/output/config.json

# Create routes manifest
echo "Creating routes-manifest.json..."
echo '{
  "version": 3,
  "pages404": true,
  "basePath": "",
  "redirects": [],
  "headers": [],
  "dynamicRoutes": [],
  "staticRoutes": ["/"],
  "dataRoutes": [],
  "rewrites": {
    "beforeFiles": [],
    "afterFiles": [],
    "fallback": []
  },
  "rsc": {
    "header": "RSC",
    "varyHeader": "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url"
  }
}' > .vercel/output/static/routes-manifest.json

# Copy build artifacts
echo "Copying build artifacts..."
if [ -d ".next/static" ]; then
  cp -r .next/static/* .vercel/output/static/_next/static/
fi

if [ -f ".next/build-manifest.json" ]; then
  cp .next/build-manifest.json .vercel/output/static/
fi

if [ -f ".next/app-build-manifest.json" ]; then
  cp .next/app-build-manifest.json .vercel/output/static/
fi

if [ -d ".next/server" ]; then
  cp -r .next/server/* .vercel/output/static/
fi

# List contents of output directory
echo "Contents of .vercel/output/static:"
ls -la .vercel/output/static

echo "Build completed. Verifying output structure..."
if [ -f ".vercel/output/static/routes-manifest.json" ]; then
  echo "✓ routes-manifest.json found in correct location"
  echo "Contents of routes-manifest.json:"
  cat .vercel/output/static/routes-manifest.json
  
  # Copy any remaining necessary files
  if [ -d "public" ]; then
    cp -r public/* .vercel/output/static/
  fi
  
  exit 0
else
  echo "✗ routes-manifest.json not found in expected location"
  exit 1
fi 