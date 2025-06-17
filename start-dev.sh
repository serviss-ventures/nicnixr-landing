#!/bin/bash

echo "🚀 Starting NixR Development Environment..."
echo ""

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:19006 | xargs kill -9 2>/dev/null
sleep 2

# Start admin dashboard
echo "📊 Starting Admin Dashboard on http://localhost:3000..."
cd admin-dashboard && npm run dev &
ADMIN_PID=$!

# Wait for admin dashboard to start
sleep 5

# Start mobile app web preview
echo "📱 Starting Mobile App Preview on http://localhost:19006..."
cd mobile-app && EXPO_NO_PROMPT=true npx expo start --web --port 19006 &
MOBILE_PID=$!

# Start website
echo "🌐 Starting Marketing Website on http://localhost:3001..."
npm run dev:website &
WEBSITE_PID=$!

echo ""
echo "✅ All services starting up..."
echo ""
echo "📊 Admin Dashboard: http://localhost:3000"
echo "📱 Mobile App Preview: http://localhost:19006"
echo "🌐 Marketing Website: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping all services...'; kill $ADMIN_PID $MOBILE_PID $WEBSITE_PID 2>/dev/null; exit" INT
wait 