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

# Clean frontend
echo "🎨 Cleaning frontend..."
cd frontend
rm -rf node_modules/.vite
rm -rf dist
rm -f tsconfig.tsbuildinfo
cd ..

# Clean backend  
echo "⚙️ Cleaning backend..."
cd backend
rm -rf dist
rm -f tsconfig.tsbuildinfo
cd ..

# Clean Docker volumes
echo "💾 Cleaning Docker volumes..."
docker volume rm cannabis-traceability-mvp_frontend_node_modules 2>/dev/null || true

echo "✅ Clean complete! Run 'docker-compose up --build' to restart fresh."
