// Base URL strategy:
// - In dev with VITE_USE_API_PROXY=true, route requests through Vite proxy at '/api' to avoid CORS.
// - Otherwise prefer VITE_API_URL; fallback to http://localhost:3001. If that fails, try the alternate port (3002/3001).
// Always proxy API calls through Vite dev server at '/api' to avoid CORS
let API_BASE = '/api';
const altBaseFor = (base: string) => base.includes('3002') ? base.replace('3002', '3001') : base.replace('3001', '3002');

async function fetchJson(path: string, init?: RequestInit) {
  const tryOnce = async (base: string) => {
    const res = await fetch(`${base}${path}`, init);
    return res;
  };
  try {
    const res = await tryOnce(API_BASE);
    return res;
  } catch (e) {
  // If using proxy, just bubble the error; proxy target is configured in Vite.
  if (API_BASE.startsWith('/')) throw e;
  // Network failure (often shown as CORS did not succeed). Try alternate base once.
    const alt = altBaseFor(API_BASE);
    try {
      const res = await tryOnce(alt);
      // If alternate succeeds, stick to it for future calls.
      API_BASE = alt;
      return res;
    } catch (e2) {
      throw e; // rethrow original
    }
  }
}

export const api = {
  async login(username: string, password: string) {
  const res = await fetchJson(`/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  async verify2FA(code: string) {
  const res = await fetchJson(`/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('2FA failed');
    return res.json();
  },
  getPlants() {
  return fetchJson(`/plants`).then((r) => r.json());
  },
  createPlant(data: { strain: string; location: string; by?: string }) {
  return fetchJson(`/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
  }).then((r) => r.json());
  },
  getHarvests() {
  return fetchJson(`/harvests`).then((r) => r.json());
  },
  createHarvest(data: { plantId: string; yieldGrams: number; status: 'drying' | 'dried'; by?: string }) {
  return fetchJson(`/harvests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getLifecycle() {
  return fetchJson(`/lifecycle`).then((r) => r.json());
  },
  getIntegrity() {
  return fetchJson(`/integrity`).then((r) => r.json());
  },
  // Reports
  getReportTypes() {
  return fetchJson(`/reports/types`).then((r) => r.json());
  },
  listReports() {
  return fetchJson(`/reports`).then((r) => r.json());
  },
  createReport(type: string) {
  return fetchJson(`/reports/${type}`, { method: 'POST' }).then((r) => r.json());
  },
  downloadReportUrl(id: string) {
  return `${API_BASE}/reports/download/${id}`;
  },
  autoReportUrl(type: string) {
  return `${API_BASE}/reports/auto/${type}`;
  },
  // Locations (Geos/Facilities/Structures)
  getGeos() {
  return fetchJson(`/locations/geos`).then((r) => r.json());
  },
  createGeo(data: { name: string; address?: string; lat?: number; lng?: number }) {
  return fetchJson(`/locations/geos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteGeo(id: string) {
  return fetchJson(`/locations/geos/${id}`, { method: 'DELETE' });
  },
  getFacilities(geoId: string) {
  return fetchJson(`/locations/facilities/${geoId}`).then((r) => r.json());
  },
  createFacility(data: { geoId: string; name: string; type: 'farm' | 'building' }) {
  return fetchJson(`/locations/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getStructures(facilityId: string) {
  return fetchJson(`/locations/structures/${facilityId}`).then((r) => r.json());
  },
  createStructure(data: { facilityId: string; name: string; type: 'room' | 'greenhouse'; size?: number; beds?: number; usage: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents'; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> }) {
  return fetchJson(`/locations/structures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  resetLocations() {
  return fetchJson(`/locations/reset`, { method: 'POST' });
  },
  // Equipment
  getEquipment() {
  return fetchJson(`/equipment`).then((r) => r.json());
  },
  createEquipment(data: { type: string; subtype: string; details: Record<string, string>; location: string; iotDevice?: string }) {
  return fetchJson(`/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getEquipmentByLocation(location: string) {
  return fetchJson(`/equipment/location/${encodeURIComponent(location)}`).then((r) => r.json());
  },
  deleteEquipment(id: string) {
  return fetchJson(`/equipment/${id}`, { method: 'DELETE' });
  },
};
