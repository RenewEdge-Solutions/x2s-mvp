const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = {
  async login(username: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  async verify2FA(code: string) {
    const res = await fetch(`${API}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('2FA failed');
    return res.json();
  },
  getPlants() {
    return fetch(`${API}/plants`).then((r) => r.json());
  },
  createPlant(data: { strain: string; location: string; by?: string }) {
    return fetch(`${API}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getHarvests() {
    return fetch(`${API}/harvests`).then((r) => r.json());
  },
  createHarvest(data: { plantId: string; yieldGrams: number; status: 'drying' | 'dried'; by?: string }) {
    return fetch(`${API}/harvests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getLifecycle() {
    return fetch(`${API}/lifecycle`).then((r) => r.json());
  },
  getIntegrity() {
    return fetch(`${API}/integrity`).then((r) => r.json());
  },
  // Reports
  getReportTypes() {
    return fetch(`${API}/reports/types`).then((r) => r.json());
  },
  listReports() {
    return fetch(`${API}/reports`).then((r) => r.json());
  },
  createReport(type: string) {
    return fetch(`${API}/reports/${type}`, { method: 'POST' }).then((r) => r.json());
  },
  downloadReportUrl(id: string) {
    return `${API}/reports/download/${id}`;
  },
  autoReportUrl(type: string) {
    return `${API}/reports/auto/${type}`;
  },
  // Locations (Geos/Facilities/Structures)
  getGeos() {
    return fetch(`${API}/locations/geos`).then((r) => r.json());
  },
  createGeo(data: { name: string; address?: string; lat?: number; lng?: number }) {
    return fetch(`${API}/locations/geos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteGeo(id: string) {
    return fetch(`${API}/locations/geos/${id}`, { method: 'DELETE' });
  },
  getFacilities(geoId: string) {
    return fetch(`${API}/locations/facilities/${geoId}`).then((r) => r.json());
  },
  createFacility(data: { geoId: string; name: string; type: 'farm' | 'building' }) {
    return fetch(`${API}/locations/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getStructures(facilityId: string) {
    return fetch(`${API}/locations/structures/${facilityId}`).then((r) => r.json());
  },
  createStructure(data: { facilityId: string; name: string; type: 'room' | 'greenhouse'; size?: number }) {
    return fetch(`${API}/locations/structures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  resetLocations() {
    return fetch(`${API}/locations/reset`, { method: 'POST' });
  },
};
