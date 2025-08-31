#!/bin/bash

# Development Start Script - Start with enhanced debugging

echo "🚀 Starting development environment with enhanced debugging..."

# Make sure we're starting fresh
echo "🧹 Cleaning previous builds..."
rm -rf frontend/node_modules/.vite frontend/dist frontend/tsconfig.tsbuildinfo
rm -rf backend/dist backend/tsconfig.tsbuildinfo

# Start containers
echo "🐳 Starting Docker containers..."
docker-compose up --build

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📖 API Docs: http://localhost:3001/docs"
echo "🐛 Backend Debug Port: 9229"
