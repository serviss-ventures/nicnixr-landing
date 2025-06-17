#!/bin/bash

# NixR Website Editor Startup Script
echo "🚀 Starting NixR Website Editor..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start all services
echo "✨ Starting services..."
echo "  - Admin Dashboard: http://localhost:3001"
echo "  - Marketing Website: http://localhost:3002"
echo ""
echo "📝 To edit website content:"
echo "  1. Open http://localhost:3001 in your browser"
echo "  2. Click 'Marketing Website' in the sidebar"
echo "  3. Go to the 'Page Editor' tab"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Run the dev command
npm run dev:all 