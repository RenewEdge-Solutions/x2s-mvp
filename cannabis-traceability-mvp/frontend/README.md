# Frontend

## Google Maps setup

The Add Location wizard uses Google Maps (Places + Map) for address verification and map picking.

1) Create `.env` in this folder (see `.env.example`) and set:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY
```

2) Enable these APIs for your key:
- Maps JavaScript API
- Places API
- Geocoding API

3) Add HTTP referrer restrictions on the key to include:
- http://localhost:5173/*
- http://127.0.0.1:5173/*

If you see "This page can't load Google Maps correctly", the key is missing, invalid, or blocked by referrer restrictions. Update your key restrictions and restart the frontend.
