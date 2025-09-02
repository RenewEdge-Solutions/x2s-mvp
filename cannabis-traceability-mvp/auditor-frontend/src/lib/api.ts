// Base URL strategy with mock-first behavior for MVP
let API_BASE = '/api';
const altBaseFor = (base: string) => base.includes('3002') ? base.replace('3002', '3001') : base.replace('3001', '3002');
const USE_MOCKS = (import.meta as any)?.env?.VITE_USE_MOCKS !== 'false';

const jsonResponse = (data: any, init: ResponseInit = { status: 200 }) =>
  new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, ...init });

async function readJson(init?: RequestInit) {
  try { if (typeof init?.body === 'string') return JSON.parse(init.body); } catch {}
  return undefined;
}

async function handleMock(path: string, init?: RequestInit): Promise<Response | null> {
  if (!USE_MOCKS) return null;
  const method = (init?.method || 'GET').toUpperCase();
  if (path === '/auth/login' && method === 'POST') return jsonResponse({ token: 'demo', user: { role: 'auditor' } });
  if (path === '/auth/verify-2fa' && method === 'POST') return jsonResponse({ ok: true });
  if (path === '/plants' && method === 'GET') return jsonResponse([]);
  if (path === '/harvests' && method === 'GET') return jsonResponse([]);
  if (path === '/locations/occupancy/alerts' && method === 'GET') return jsonResponse({ emptyStructures: [], lowUtilizationStructures: [], overCapacityStructures: [] });
  if (path === '/events' && method === 'GET') return jsonResponse([]);
  return null;
}

async function fetchJson(path: string, init?: RequestInit) {
  if (USE_MOCKS) {
    const mock = await handleMock(path, init);
    if (mock) return mock;
    const method = (init?.method || 'GET').toUpperCase();
    const empty = method === 'GET' ? [] : { ok: true };
    return jsonResponse(empty);
  }
  const tryOnce = async (base: string) => {
    const res = await fetch(`${base}${path}`, init);
    // If we get a 500 error, throw an error to trigger fallbacks
    if (!res.ok && res.status >= 500) {
      throw new Error(`Server error: ${res.status}`);
    }
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

// Helper function to safely call API with fallback to empty array
async function safeApiCall<T>(apiCall: () => Promise<Response>, fallback: T[] = []): Promise<T[]> {
  try {
    const response = await apiCall();
    if (!response.ok) {
      console.warn(`API call failed with status ${response.status}`);
      return fallback;
    }
    const data = await response.json();
    return Array.isArray(data) ? data : fallback;
  } catch (error) {
    console.warn('API call failed:', error);
    return fallback;
  }
}

// Helper function to safely call API with fallback to empty object
async function safeApiCallObject<T>(apiCall: () => Promise<Response>, fallback: T = {} as T): Promise<T> {
  try {
    const response = await apiCall();
    if (!response.ok) {
      console.warn(`API call failed with status ${response.status}`);
      return fallback;
    }
    const data = await response.json();
    return data ?? fallback;
  } catch (error) {
    console.warn('API call failed:', error);
    return fallback;
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
    return safeApiCall(() => fetchJson(`/plants`));
  },
  createPlant(data: { strain: string; location: string; by?: string }) {
    return fetchJson(`/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  germinateFromSeed(data: { seedId: string; strain: string; location: string; by?: string; quantity?: number }) {
    return fetchJson(`/plants/germinate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  relocatePlant(plantId: string, location: string) {
    return fetchJson(`/plants/${plantId}/relocate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    }).then((r) => r.json());
  },
  flipPlant(plantId: string) {
    return fetchJson(`/plants/${plantId}/flip`, {
      method: 'PUT',
    }).then((r) => r.json());
  },
  harvestPlant(plantId: string) {
    return fetchJson(`/plants/${plantId}/harvest`, {
      method: 'PUT',
    }).then((r) => r.json());
  },
  dryPlant(plantId: string) {
    return fetchJson(`/plants/${plantId}/dry`, {
      method: 'PUT',
    }).then((r) => r.json());
  },
  markPlantDried(plantId: string) {
    return fetchJson(`/plants/${plantId}/dried`, {
      method: 'PUT',
    }).then((r) => r.json());
  },
  changePlantStage(plantId: string, stage: string) {
    return fetchJson(`/plants/${plantId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    }).then((r) => r.json());
  },
  deletePlant(plantId: string, reason: string, by?: string) {
    return fetchJson(`/plants/${plantId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, by }),
    }).then((r) => r.json());
  },
  getHarvests() {
    return safeApiCall(() => fetchJson(`/harvests`));
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
  updateGeo(id: string, data: { name: string; address?: string; lat?: number; lng?: number }) {
  return fetchJson(`/locations/geos/${id}`, {
      method: 'PUT',
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
  updateFacility(id: string, data: { name: string; type?: 'farm' | 'building' }) {
  return fetchJson(`/locations/facilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteFacility(id: string) {
  return fetchJson(`/locations/facilities/${id}`, { method: 'DELETE' });
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
  updateStructure(id: string, data: { name: string; type: 'room' | 'greenhouse'; size?: number; beds?: number; usage: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents'; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> }) {
  return fetchJson(`/locations/structures/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteStructure(id: string) {
  return fetchJson(`/locations/structures/${id}`, { method: 'DELETE' });
  },
  resetLocations() {
  return fetchJson(`/locations/reset`, { method: 'POST' });
  },
  // Equipment
  getEquipment() {
  return fetchJson(`/equipment`).then((r) => r.json());
  },
  createEquipment(data: { type: string; subtype: string; details: Record<string, string>; location: string; structureId?: string; iotDevice?: string }) {
  return fetchJson(`/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  updateEquipment(id: string, data: { type: string; subtype: string; details: Record<string, string>; location: string; structureId?: string; iotDevice?: string }) {
  return fetchJson(`/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getEquipmentByLocation(location: string) {
  return fetchJson(`/equipment/location/${encodeURIComponent(location)}`).then((r) => r.json());
  },
  getEquipmentByStructureId(structureId: string) {
  return fetchJson(`/equipment/structure/${encodeURIComponent(structureId)}`).then((r) => r.json());
  },
  deleteEquipment(id: string) {
    return fetchJson(`/equipment/${id}`, { method: 'DELETE' });
  },

  // Inventory API
  createInventoryItem(data: {
    name: string;
    category: string;
    subcategory: string;
    itemType?: string;
    quantity: number;
    unit: string;
    location: string;
    supplier?: string;
    purchaseDate?: string;
    expiryDate?: string;
    cost?: number;
    specificFields?: Record<string, any>;
  }) {
    return fetchJson('/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  getInventoryItems() {
    return fetchJson('/inventory').then((r) => r.json());
  },
  getInventoryItem(id: string) {
    return fetchJson(`/inventory/${id}`).then((r) => r.json());
  },
  updateInventoryItem(id: string, data: Partial<{
    name: string;
    category: string;
    subcategory: string;
    itemType?: string;
    quantity: number;
    unit: string;
    location: string;
    supplier?: string;
    purchaseDate?: string;
    expiryDate?: string;
    cost?: number;
    specificFields?: Record<string, any>;
  }>) {
    return fetchJson(`/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteInventoryItem(id: string) {
    return fetchJson(`/inventory/${id}`, { method: 'DELETE' });
  },
  getInventoryByCategory(category: string) {
    return fetchJson(`/inventory/category/${encodeURIComponent(category)}`).then((r) => r.json());
  },
  getInventoryBySubcategory(category: string, subcategory: string) {
    return fetchJson(`/inventory/category/${encodeURIComponent(category)}/subcategory/${encodeURIComponent(subcategory)}`).then((r) => r.json());
  },

  // Additional missing Location methods
  getAllStructures() {
    return fetchJson(`/locations/structures`).then((r) => r.json());
  },
  getAllOccupancy() {
    return safeApiCall(() => fetchJson(`/locations/occupancy`));
  },
  getFacilityOccupancy(facilityId: string) {
    return fetchJson(`/locations/occupancy/facility/${facilityId}`).then((r) => r.json());
  },
  getStructureOccupancy(structureId: string) {
    return fetchJson(`/locations/occupancy/structure/${structureId}`).then((r) => r.json());
  },
  getEmptyCapacityAlerts() {
    return safeApiCallObject(() => fetchJson(`/locations/occupancy/alerts`), {
      emptyStructures: [],
      lowUtilizationStructures: [],
      overCapacityStructures: []
    });
  },

  // Events API
  getEvents() {
    return safeApiCall(() => fetchJson('/events'));
  },
  createEvent(data: {
    title: string;
    description?: string;
    eventType: string;
    startDate: string;
    endDate?: string;
    location?: string;
    metadata?: Record<string, any>;
  }) {
    return fetchJson('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  updateEvent(id: number, data: Partial<{
    title: string;
    description?: string;
    eventType: string;
    startDate: string;
    endDate?: string;
    location?: string;
    metadata?: Record<string, any>;
  }>) {
    return fetchJson(`/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  deleteEvent(id: number) {
    return fetchJson(`/events/${id}`, { method: 'DELETE' });
  },
};
