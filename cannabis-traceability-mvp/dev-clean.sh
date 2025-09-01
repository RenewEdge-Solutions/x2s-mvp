#!/bin/bash

# Development Clean Script - Reset everything for fresh development

echo "🧹 Cleaning development environment..."

# Stop all containers
echo "🛑 Stopping Docker containers..."
docker-compose down

# Clean Docker build cache
echo "🐳 Cleaning Docker build cache..."
docker system prune -f
docker builder prune -f

## Generic frontend removed; no cleaning needed here

# Clean backend  
echo "⚙️ Cleaning backend..."
cd backend
rm -rf dist
rm -f tsconfig.tsbuildinfo
cd ..

# No generic frontend volume to clean anymore

echo "✅ Clean complete! Run 'docker-compose up --build' to restart fresh."
