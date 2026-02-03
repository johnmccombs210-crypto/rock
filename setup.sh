#!/bin/bash
# Quick Start Script for Stealth Proxy

echo "🔐 Stealth Proxy - Quick Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    echo "Try running: npm install"
    exit 1
fi

echo ""
echo "🔑 Authenticating with Cloudflare..."
echo "A browser window will open. Click 'Allow' to authorize."
echo ""

# Login to Cloudflare
npx wrangler login

echo ""
echo "🚀 Deploying to Cloudflare Workers..."
echo ""

npm run deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your proxy is now live! 🎉"
echo ""
echo "Next steps:"
echo "1. Check the URL above (https://...)"
echo "2. Visit it in your browser"
echo "3. Enter any website URL to proxy it"
echo ""
echo "Questions? Check out:"
echo "- README.md for features & options"
echo "- DEPLOY.md for troubleshooting"
echo "- ADVANCED.md for customization"
echo ""
