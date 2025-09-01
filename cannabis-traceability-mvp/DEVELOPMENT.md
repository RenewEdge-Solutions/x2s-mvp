# 🔧 Development Environment Setup

This project now includes enhanced debugging and hot reload capabilities to make development more efficient and prevent caching issues.

## 🚀 Quick Start (Enhanced Development)

### Option 1: Using Helper Scripts
```bash
# Clean everything and start fresh
./dev-clean.sh
./dev-start.sh
```

### Option 2: Manual Docker Commands
```bash
# Clean start
docker-compose down
docker-compose up --build
```

## 🔧 Enhanced Development Features

### Frontend (Vite) Enhancements
- **Aggressive Hot Reloading**: 50ms polling interval for instant updates
- **Disabled Caching**: All Vite caches disabled in development
- **Source Maps**: Full source maps for easier debugging
- **HMR Websocket**: Dedicated port (24678) for hot module replacement
- **Debug Scripts**: `npm run dev:debug` for enhanced debugging
- **Browser DevTools**: Auto-enabled React DevTools and debug helpers

### Backend (NestJS) Enhancements
- **Watch Mode**: Instant restart on file changes
- **Debug Port**: Node.js debugging on port 9229
- **Preserve Output**: Better console output formatting
- **No Type Checking**: Faster compilation by disabling type check in watch mode
- **Enhanced Scripts**: `npm run start:hot` for maximum responsiveness

### Development Tools Available in Browser
When running in development mode, open browser console and use:
```javascript
// Clear all localStorage/sessionStorage
window.debugApp.clearStorage()

// Force page reload
window.debugApp.reload()

// Show environment variables
window.debugApp.env()

// Access API module for testing
window.debugApp.api()
```

## 🐛 Debugging Ports
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **Node.js Debug**: localhost:9229 (for IDE debugging)
- **HMR Websocket**: localhost:24678

## 🧹 Cleaning Commands

### Frontend Cleaning
The generic `frontend` has been removed. Use the specific apps instead (auditor-frontend, regulator-frontend).

### Backend Cleaning
```bash
cd backend
npm run clean          # Clean build artifacts
npm run reset          # Clean + reinstall dependencies
npm run build:clean     # Clean + rebuild
```

### Full Environment Reset
```bash
./dev-clean.sh         # Reset everything
docker system prune -f # Clean Docker cache
```

## 📝 Development Scripts Summary

### Frontend Scripts
Use scripts within each specific frontend folder.

### Backend Scripts
- `npm run start:dev` - Standard watch mode
- `npm run start:debug` - Debug mode with inspector
- `npm run start:hot` - Maximum hot reload responsiveness
- `npm run clean` - Clean build artifacts
- `npm run reset` - Clean + reinstall

## 🔍 Troubleshooting

### Changes Not Appearing?
1. Check if containers are running: `docker-compose ps`
2. Clean everything: `./dev-clean.sh`
3. Restart fresh: `./dev-start.sh`
4. Check browser console for HMR connection issues

### Performance Issues?
- The enhanced polling may use more CPU
- Adjust `interval` in vite.config.ts (currently 50ms)
- Use `npm run dev` instead of `npm run dev:debug` for lighter mode

### Cache Issues?
- Frontend: `npm run dev:clean`
- Backend: `npm run build:clean`
- Full reset: `./dev-clean.sh`

## 📊 File Watching Optimizations
- **Backend**: Uses fsEvents on macOS for efficient file watching
- **Docker**: Volume mounts exclude build directories to prevent conflicts
- **TypeScript**: Incremental compilation disabled for fresh builds

This setup ensures you see changes immediately without cache-related delays!
