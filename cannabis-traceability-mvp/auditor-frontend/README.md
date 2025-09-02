# Auditor Frontend

Vite + React app for the Auditor role.

## Run

- Docker: part of the root docker-compose at http://localhost:9002
- Local: `npm install && npm run dev` (listens on :9002)

Back to landing: http://localhost:9000

## 🗺️ Google Maps Integration

The Add Location wizard uses Google Maps for address verification and map picking.

### Setup Steps

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure API Key**
   Edit `.env` and add your Google Maps API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Enable Required APIs**
   In Google Cloud Console, enable:
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API

4. **Set Referrer Restrictions**
   Add these to your API key restrictions:
   - `http://localhost:9002/*`
   - `http://127.0.0.1:9002/*`

### Troubleshooting

If you see **"This page can't load Google Maps correctly"**:
- 🔍 Check that your API key is valid
- 🔒 Verify referrer restrictions allow localhost
- 🔄 Restart the frontend development server
- 📝 Check browser console for detailed error messages

### Alternative
Without a valid API key, the location features will be disabled, but the rest of the application will function normally.
