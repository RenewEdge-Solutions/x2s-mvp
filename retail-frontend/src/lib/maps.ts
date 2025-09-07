// Removed Google Maps import

let loader: any = null;

export function initGoogleMaps() {
  // Google Maps removed
  return null;
}

export async function loadGoogleMaps(): Promise<any> {
  // Google Maps removed
  throw new Error('Google Maps has been removed from the project.');
}

export type PlaceSelection = {
  description: string;
  formattedAddress?: string;
  latLng?: { lat: number; lng: number };
};
