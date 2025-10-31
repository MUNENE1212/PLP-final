#!/bin/bash
# Render build script for backend

set -e

echo "🔨 Installing backend dependencies..."
npm ci --only=production

echo "✅ Build completed successfully!"
