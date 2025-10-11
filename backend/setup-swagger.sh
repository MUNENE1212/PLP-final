#!/bin/bash

# BaiTech Swagger Setup Script
# This script installs Swagger dependencies and verifies the setup

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          BaiTech API - Swagger Setup Script                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the backend directory"
    exit 1
fi

echo "📦 Installing Swagger dependencies..."
npm install --save swagger-jsdoc swagger-ui-express

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Swagger dependencies installed successfully!"
else
    echo "❌ Installation failed. Please check your npm setup."
    exit 1
fi

echo ""
echo "🔍 Verifying installation..."

# Check if swagger-jsdoc is installed
if npm list swagger-jsdoc > /dev/null 2>&1; then
    echo "  ✓ swagger-jsdoc installed"
else
    echo "  ✗ swagger-jsdoc NOT found"
fi

# Check if swagger-ui-express is installed
if npm list swagger-ui-express > /dev/null 2>&1; then
    echo "  ✓ swagger-ui-express installed"
else
    echo "  ✗ swagger-ui-express NOT found"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo "  1. Start your MongoDB server"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:5000/api-docs"
echo ""
echo "📖 For detailed guide, see: SWAGGER_TESTING_GUIDE.md"
echo ""
