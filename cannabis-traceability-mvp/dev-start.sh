#!/bin/bash

# Development Start Script - Start with enhanced debugging

echo "🚀 Starting development environment with enhanced debugging..."

# Make sure we're starting fresh
echo "🧹 Cleaning previous builds..."
## backend removed; no cleaning necessary

# Start containers
echo "🐳 Starting Docker containers..."
docker-compose up --build

echo "✅ Development environment started!"
echo "ℹ️ Backend removed from this setup"
