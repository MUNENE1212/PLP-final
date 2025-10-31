#!/bin/bash
# Render build script for frontend

set -e

echo "🔨 Installing frontend dependencies..."
npm ci

echo "🏗️ Building frontend for production..."
npm run build

echo "✅ Build completed successfully!"
echo "📦 Build artifacts in: ./dist"
