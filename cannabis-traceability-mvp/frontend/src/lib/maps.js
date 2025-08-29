import { Loader } from '@googlemaps/js-api-loader';
let loader = null;
let apiKey = undefined;
export function initGoogleMaps(key) {
    apiKey = key || apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey)
        return null;
    if (!loader) {
        loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places', 'marker']
        });
    }
    return loader;
}
export async function loadGoogleMaps(key) {
    const l = initGoogleMaps(key);
    if (!l)
        throw new Error('Google Maps API key missing. Set VITE_GOOGLE_MAPS_API_KEY.');
    // If apiKey is missing, still attempt load to surface a clear error in UI
    await l.load();
    return window.google;
}
