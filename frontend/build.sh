#!/bin/bash

# Don't exit immediately on error, we want to see what's happening
set +e

echo "Starting build process..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next
rm -rf .vercel
rm -rf node_modules/.cache

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
export NEXT_DISABLE_CACHE=1

# Run Next.js build
echo "Running Next.js build..."
npm run vercel-build
BUILD_EXIT_CODE=$?

echo "Build process exited with code: $BUILD_EXIT_CODE"

# Create Vercel output directory structure
echo "Creating Vercel output directory structure..."
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions/_next/server

# Create config.json for routing
echo "Creating config.json..."
cat > .vercel/output/config.json << EOL
{
  "version": 3,
  "routes": [
    {
      "src": "^/_next/static/(.*)$",
      "headers": { "cache-control": "public,max-age=31536000,immutable" },
      "continue": true
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
EOL

# Copy static assets
echo "Copying static assets..."
if [ -d ".next/static" ]; then
  mkdir -p .vercel/output/static/_next/static
  cp -r .next/static/* .vercel/output/static/_next/static/
fi

# Copy public directory
if [ -d "public" ]; then
  cp -r public/* .vercel/output/static/
fi

# Create serverless functions for each page
echo "Creating serverless functions..."

# Index function
mkdir -p .vercel/output/functions/index.func
cat > .vercel/output/functions/index.func/index.js << EOL
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage, ServerResponse } from 'http';
import { renderToHTML } from 'next/dist/server/render';
import { getRequestHandler } from 'next/dist/server/next-server';

export default async function handler(req, res) {
  // Convert req and res to NextRequest and NextResponse
  const nextReq = new NextRequest(req);
  const nextRes = new NextResponse();
  
  // Call the Next.js handler
  return await getRequestHandler()(nextReq, nextRes);
}
EOL

# Create package.json for functions
cat > .vercel/output/functions/index.func/package.json << EOL
{
  "name": "daily-dose-function",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
EOL

# Link node_modules to the function
cp -r node_modules .vercel/output/functions/index.func/

# Copy next server files
if [ -d ".next/server" ]; then
  cp -r .next/server/* .vercel/output/functions/_next/server/
fi

if [ -d ".next/cache" ]; then
  mkdir -p .vercel/output/functions/_next/cache
  cp -r .next/cache/* .vercel/output/functions/_next/cache/
fi

# Copy next config and manifest files
cp -r .next/required-server-files.json .vercel/output/functions/_next/ 2>/dev/null || echo "No required-server-files.json found"
cp -r .next/routes-manifest.json .vercel/output/functions/_next/ 2>/dev/null || echo "No routes-manifest.json found" 
cp -r .next/build-manifest.json .vercel/output/functions/_next/ 2>/dev/null || echo "No build-manifest.json found"
cp -r .next/prerender-manifest.json .vercel/output/functions/_next/ 2>/dev/null || echo "No prerender-manifest.json found"

# Create .vc-config.json for the function
cat > .vercel/output/functions/index.func/.vc-config.json << EOL
{
  "runtime": "nodejs18.x",
  "handler": "index.js",
  "launcherType": "Nodejs"
}
EOL

# Check if we need to create an API function
if [ -d ".next/server/pages/api" ]; then
  mkdir -p .vercel/output/functions/api/\[\[path\]\].func
  cp -r .vercel/output/functions/index.func/* .vercel/output/functions/api/\[\[path\]\].func/
  # Create a specialized handler for API routes
  cat > .vercel/output/functions/api/\[\[path\]\].func/index.js << EOL
import { getApiHandler } from 'next/dist/server/api-utils/get-api-handler';

export default async function handler(req, res) {
  const apiHandler = getApiHandler();
  return await apiHandler(req, res);
}
EOL
fi

echo "Build completed. Output structure:"
find .vercel/output -type f | sort

exit 0 