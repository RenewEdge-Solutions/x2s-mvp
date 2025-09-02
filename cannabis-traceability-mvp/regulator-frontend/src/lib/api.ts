// Base URL strategy:
// - Dev: proxy via '/api' (Vite dev server). This repo is frontend-only, so we also include a mock fallback.
// - If a real API is provided, set VITE_API_URL and VITE_USE_MOCKS=false to bypass mocks.
let API_BASE = '/api';
const altBaseFor = (base: string) => base.includes('3002') ? base.replace('3002', '3001') : base.replace('3001', '3002');

// In-browser mock API fallback (enabled by default for this frontend-only MVP)
const USE_MOCKS = (import.meta as any)?.env?.VITE_USE_MOCKS !== 'false';

type Plant = { id: string; strain: string; location: string; stage: string; createdAt: string };
type Harvest = { id: string; plantId: string; yieldGrams: number; status: 'drying' | 'dried'; date: string };

let mockPlants: Plant[] = [
  { id: 'p-1001', strain: 'Blue Dream', location: 'Geo A / Farm HQ / Room 1', stage: 'Vegetative', createdAt: new Date().toISOString() },
  { id: 'p-1002', strain: 'OG Kush', location: 'Geo A / Farm HQ / Room 2', stage: 'Flowering', createdAt: new Date().toISOString() },
  { id: 'p-1003', strain: 'Pineapple Express', location: 'Geo B / Greenhouse 3', stage: 'Vegetative', createdAt: new Date().toISOString() },
];

let mockHarvests: Harvest[] = [
  { id: 'h-5001', plantId: 'p-1002', yieldGrams: 420, status: 'drying', date: new Date().toISOString() },
];

let mockAlerts = {
  emptyStructures: [
    { id: 'st-201', name: 'Room 3', facility: 'Farm HQ', capacity: 20, occupied: 0 },
  ],
  lowUtilizationStructures: [
    { id: 'st-101', name: 'Greenhouse 1', facility: 'Farm HQ', capacity: 100, occupied: 25 },
  ],
  overCapacityStructures: [],
};

// Tiny helper to make a JSON Response
const jsonResponse = (data: any, init: ResponseInit = { status: 200 }) =>
  new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, ...init });

// Parse JSON body for mock POST/PUT handlers
async function readJson(init?: RequestInit) {
  try {
    if (!init?.body) return undefined;
    if (typeof init.body === 'string') return JSON.parse(init.body);
    // When using fetch with a ReadableStream, it's uncommon here; skip for simplicity
  } catch {
    /* noop */
  }
  return undefined;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Handle a subset of endpoints we use in the UI so pages load without a backend
async function handleMock(path: string, init?: RequestInit): Promise<Response | null> {
  if (!USE_MOCKS) return null;
  const method = (init?.method || 'GET').toUpperCase();

  // Auth (fake, always succeeds)
  if (path === '/auth/login' && method === 'POST') {
    return jsonResponse({ token: 'demo-token', user: { role: 'regulator', name: 'Regulator' } });
  }
  if (path === '/auth/verify-2fa' && method === 'POST') {
    return jsonResponse({ ok: true });
  }

  // Plants
  if (path === '/plants' && method === 'GET') {
    return jsonResponse(mockPlants);
  }
  if (path === '/plants' && method === 'POST') {
    const body = await readJson(init);
    const newPlant: Plant = {
      id: makeId('p'),
      strain: body?.strain ?? 'Unknown',
      location: body?.location ?? 'Unassigned',
      stage: 'Vegetative',
      createdAt: new Date().toISOString(),
    };
    mockPlants = [newPlant, ...mockPlants];
    return jsonResponse(newPlant, { status: 201 });
  }

  // Harvests
  if (path === '/harvests' && method === 'GET') {
    return jsonResponse(mockHarvests);
  }
  if (path === '/harvests' && method === 'POST') {
    const body = await readJson(init);
    const newHarvest: Harvest = {
      id: makeId('h'),
      plantId: body?.plantId ?? mockPlants[0]?.id ?? 'p-0',
      yieldGrams: body?.yieldGrams ?? 0,
      status: body?.status ?? 'drying',
      date: new Date().toISOString(),
    };
    mockHarvests = [newHarvest, ...mockHarvests];
    return jsonResponse(newHarvest, { status: 201 });
  }

  // Locations occupancy
  if (path === '/locations/occupancy/alerts' && method === 'GET') {
    return jsonResponse(mockAlerts);
  }
  if (path === '/locations/occupancy' && method === 'GET') {
    // Basic occupancy list derived from plants
    const grouped = [
      { structureId: 'st-101', structure: 'Greenhouse 1', facility: 'Farm HQ', occupied: 25, capacity: 100 },
      { structureId: 'st-102', structure: 'Room 1', facility: 'Farm HQ', occupied: 10, capacity: 20 },
    ];
    return jsonResponse(grouped);
  }

  // Reports
  if (path === '/reports/types' && method === 'GET') {
    return jsonResponse(['weekly-inventory', 'monthly-compliance']);
  }
  if (path === '/reports' && method === 'GET') {
    return jsonResponse([]);
  }

  // Inventory (read-only minimal)
  if (path === '/inventory' && method === 'GET') {
    return jsonResponse([
      { id: 'i-1', name: 'Nutrient A', category: 'Supplies', quantity: 5, unit: 'bottles', location: 'Room 1' },
    ]);
  }

  // Events
  if (path === '/events' && method === 'GET') {
    return jsonResponse([
      { id: 1, title: 'Inspection', eventType: 'audit', startDate: new Date().toISOString() },
    ]);
  }

  // Not mocked
  return null;
}

async function fetchJson(path: string, init?: RequestInit) {
  // MVP: do not perform real network calls. Serve mocks or empty data.
  if (USE_MOCKS) {
    const mock = await handleMock(path, init);
    if (mock) return mock;
    const method = (init?.method || 'GET').toUpperCase();
    const emptyPayload = method === 'GET' ? [] : { ok: true };
    return jsonResponse(emptyPayload);
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
  // If using proxy, attempt mock fallback first (frontend-only mode)
  if (API_BASE.startsWith('/')) {
    const mock = await handleMock(path, init);
    if (mock) return mock;
    throw e;
  }
  // Network failure (often shown as CORS did not succeed). Try alternate base once.
    const alt = altBaseFor(API_BASE);
    try {
      const res = await tryOnce(alt);
      // If alternate succeeds, stick to it for future calls.
      API_BASE = alt;
      return res;
    } catch (e2) {
    // As a last fallback, try mocks if enabled
    const mock = await handleMock(path, init);
    if (mock) return mock;
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
