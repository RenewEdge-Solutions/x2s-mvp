// Base URL strategy:
// - Dev: proxy via '/api' (Vite dev server). This repo is frontend-only, so we also include a mock fallback.
// - If a real API is provided, set VITE_API_URL and VITE_USE_MOCKS=false to bypass mocks.
let API_BASE = '/api';
const altBaseFor = (base: string) => base.includes('3002') ? base.replace('3002', '3001') : base.replace('3001', '3002');

// In-browser mock API fallback (enabled by default for this frontend-only MVP)
const USE_MOCKS = (import.meta as any)?.env?.VITE_USE_MOCKS !== 'false';

type Plant = { id: string; strain: string; location: string; stage: string; createdAt: string; plantedAt?: string; harvested?: boolean };
type Harvest = { id: string; plantId: string; yieldGrams: number; status: 'drying' | 'dried'; date: string; harvestedAt?: string };

let mockPlants: Plant[] = [
  { id: 'p-1001', strain: 'Blue Dream', location: 'Geo A / Farm HQ / Room 1', stage: 'Vegetative', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 20*86400000).toISOString() },
  { id: 'p-1002', strain: 'OG Kush', location: 'Geo A / Farm HQ / Room 2', stage: 'Flowering', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 45*86400000).toISOString() },
  { id: 'p-1003', strain: 'Pineapple Express', location: 'Geo B / Greenhouse 3', stage: 'Vegetative', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 12*86400000).toISOString() },
  { id: 'p-1004', strain: 'Sour Diesel', location: 'Geo B / Greenhouse 2', stage: 'Vegetative', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 8*86400000).toISOString() },
  { id: 'p-1005', strain: 'Gelato', location: 'Geo A / Farm HQ / Room 3', stage: 'Vegetative', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 14*86400000).toISOString() },
  { id: 'p-1006', strain: 'Afghan Kush', location: 'Geo C / Outdoor Plot 1', stage: 'Flowering', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 52*86400000).toISOString() },
  { id: 'p-1007', strain: 'Northern Lights', location: 'Geo A / Farm HQ / Room 1', stage: 'Vegetative', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 'p-1008', strain: 'Gorilla Glue', location: 'Geo B / Greenhouse 1', stage: 'Flowering', createdAt: new Date().toISOString(), plantedAt: new Date(Date.now() - 33*86400000).toISOString() },
];

let mockHarvests: Harvest[] = [
  { id: 'h-5001', plantId: 'p-1002', yieldGrams: 420, status: 'drying', date: new Date().toISOString(), harvestedAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 'h-5002', plantId: 'p-1008', yieldGrams: 380, status: 'dried', date: new Date().toISOString(), harvestedAt: new Date(Date.now() - 12*86400000).toISOString() },
];

// Lifecycle history (mock): realistic seed-to-sale chain for a few batches
type LifecycleEvent =
  | { type: 'seed-received'; batchId: string; lot: string; quantity: number; receivedAt: string; supplier: string }
  | { type: 'germination'; batchId: string; startedAt: string; method: 'paper-towel' | 'cube' | 'direct-seed'; by: string }
  | { type: 'transplant'; batchId: string; from: string; to: string; count: number; at: string }
  | { type: 'flip-to-flower'; batchId: string; at: string; by: string }
  | { type: 'harvest'; batchId: string; harvestedAt: string; wetWeightKg: number; trimmedBy: string }
  | { type: 'drying'; batchId: string; startedAt: string; location: string; targetDays: number }
  | { type: 'lab-submission'; batchId: string; submittedAt: string; lab: string; tests: string[] }
  | { type: 'coa-issued'; batchId: string; issuedAt: string; lab: string; result: 'pass' | 'fail'; thcPct: number; cbdPct: number }
  | { type: 'packaged'; batchId: string; packagedAt: string; sku: string; units: number }
  | { type: 'transfer'; batchId: string; transferredAt: string; to: string; manifestId: string };

// Licensing events (mock) for Lifecycle integration
type LicensingEvent =
  | { type: 'application-submitted'; licenceId: string; holder: string; submittedAt: string; submittedBy: string }
  | { type: 'license-issued'; licenceId: string; holder: string; issuedAt: string }
  | { type: 'license-renewed'; licenceId: string; holder: string; renewedAt: string; until: string }
  | { type: 'license-amended'; licenceId: string; holder: string; amendedAt: string; fields: string[] }
  | { type: 'license-suspended'; licenceId: string; holder: string; suspendedAt: string; reason: string }
  | { type: 'license-reinstated'; licenceId: string; holder: string; reinstatedAt: string }
  | { type: 'fee-payment'; licenceId: string; amount: number; currency: string; at: string };

const now = new Date();
function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

let mockLifecycle: LifecycleEvent[] = [
  { type: 'seed-received', batchId: 'B-23-091', lot: 'SLU-SED-7781', quantity: 500, receivedAt: daysAgo(68), supplier: 'CaribSeed Ltd.' },
  { type: 'germination', batchId: 'B-23-091', startedAt: daysAgo(67), method: 'cube', by: 'J. Pierre' },
  { type: 'transplant', batchId: 'B-23-091', from: 'Nursery A', to: 'Greenhouse 1 - Bed A', count: 420, at: daysAgo(53) },
  { type: 'flip-to-flower', batchId: 'B-23-091', at: daysAgo(39), by: 'Supervisor D. Charles' },
  { type: 'harvest', batchId: 'B-23-091', harvestedAt: daysAgo(10), wetWeightKg: 182.4, trimmedBy: 'Crew GH1' },
  { type: 'drying', batchId: 'B-23-091', startedAt: daysAgo(9), location: 'Dry Room 2', targetDays: 10 },
  { type: 'lab-submission', batchId: 'B-23-091', submittedAt: daysAgo(6), lab: 'St. Lucia State Lab', tests: ['Potency', 'Pesticides', 'Microbial'] },
  { type: 'coa-issued', batchId: 'B-23-091', issuedAt: daysAgo(3), lab: 'St. Lucia State Lab', result: 'pass', thcPct: 21.3, cbdPct: 0.4 },
  { type: 'packaged', batchId: 'B-23-091', packagedAt: daysAgo(2), sku: 'FLOW-14G', units: 1200 },
  { type: 'transfer', batchId: 'B-23-091', transferredAt: daysAgo(1), to: 'Pharmacy West Indies Ltd.', manifestId: 'MAN-784-0091' },

  { type: 'seed-received', batchId: 'B-23-104', lot: 'SLU-SED-7799', quantity: 600, receivedAt: daysAgo(35), supplier: 'CaribSeed Ltd.' },
  { type: 'germination', batchId: 'B-23-104', startedAt: daysAgo(34), method: 'paper-towel', by: 'A. Smith' },
  { type: 'transplant', batchId: 'B-23-104', from: 'Nursery A', to: 'Greenhouse 2 - Bed C', count: 512, at: daysAgo(21) },
  { type: 'flip-to-flower', batchId: 'B-23-104', at: daysAgo(7), by: 'Supervisor H. James' },

  // Batch with failed COA then retest
  { type: 'seed-received', batchId: 'B-23-108', lot: 'SLU-SED-7811', quantity: 400, receivedAt: daysAgo(50), supplier: 'Island Genomics' },
  { type: 'germination', batchId: 'B-23-108', startedAt: daysAgo(49), method: 'cube', by: 'M. Joseph' },
  { type: 'transplant', batchId: 'B-23-108', from: 'Nursery B', to: 'Greenhouse 3 - Bed B', count: 360, at: daysAgo(36) },
  { type: 'flip-to-flower', batchId: 'B-23-108', at: daysAgo(22), by: 'Supervisor S. Payne' },
  { type: 'harvest', batchId: 'B-23-108', harvestedAt: daysAgo(8), wetWeightKg: 141.9, trimmedBy: 'Crew GH3' },
  { type: 'drying', batchId: 'B-23-108', startedAt: daysAgo(7), location: 'Dry Room 1', targetDays: 9 },
  { type: 'lab-submission', batchId: 'B-23-108', submittedAt: daysAgo(5), lab: 'Accredited Lab SLU', tests: ['Potency', 'Heavy Metals', 'Microbial'] },
  { type: 'coa-issued', batchId: 'B-23-108', issuedAt: daysAgo(3), lab: 'Accredited Lab SLU', result: 'fail', thcPct: 18.1, cbdPct: 0.7 },
  { type: 'lab-submission', batchId: 'B-23-108', submittedAt: daysAgo(2), lab: 'Accredited Lab SLU', tests: ['Potency', 'Microbial (retest)'] },
  { type: 'coa-issued', batchId: 'B-23-108', issuedAt: daysAgo(1), lab: 'Accredited Lab SLU', result: 'pass', thcPct: 18.0, cbdPct: 0.6 },
  { type: 'packaged', batchId: 'B-23-108', packagedAt: daysAgo(1), sku: 'FLOW-7G', units: 800 },
  { type: 'transfer', batchId: 'B-23-108', transferredAt: daysAgo(0), to: 'Medical Distributor SLU', manifestId: 'MAN-784-0110' },

  // New batch in veg
  { type: 'seed-received', batchId: 'B-23-115', lot: 'SLU-SED-7833', quantity: 700, receivedAt: daysAgo(12), supplier: 'CaribSeed Ltd.' },
  { type: 'germination', batchId: 'B-23-115', startedAt: daysAgo(11), method: 'paper-towel', by: 'E. Jules' },
  { type: 'transplant', batchId: 'B-23-115', from: 'Nursery A', to: 'Greenhouse 4 - Bed A', count: 610, at: daysAgo(2) },
];

// Seed licensing events to appear in Lifecycle view
let mockLicensingEvents: LicensingEvent[] = [
  { type: 'application-submitted', licenceId: 'LIC-0201', holder: 'Green Leaf Holdings', submittedAt: daysAgo(40), submittedBy: 'Portal: user@greenleaf.example' },
  { type: 'license-issued', licenceId: 'LIC-0201', holder: 'Green Leaf Holdings', issuedAt: daysAgo(35) },
  { type: 'fee-payment', licenceId: 'LIC-0201', amount: 25000, currency: 'XCD', at: daysAgo(35) },
  { type: 'license-amended', licenceId: 'LIC-0123', holder: 'Island Herbals Inc.', amendedAt: daysAgo(13), fields: ['Address', 'Responsible Person'] },
  { type: 'license-renewed', licenceId: 'LIC-0099', holder: 'Ganja Co. Ltd.', renewedAt: daysAgo(21), until: '2026-06-30' },
  { type: 'license-suspended', licenceId: 'LIC-1102', holder: 'Harbor Dispensary', suspendedAt: daysAgo(20), reason: 'Compliance issues' },
  { type: 'license-reinstated', licenceId: 'LIC-1102', holder: 'Harbor Dispensary', reinstatedAt: daysAgo(5) },
];

let mockAlerts = {
  emptyStructures: [
    { structureId: 'st-201', structureType: 'Room', structureName: 'Room 3', facilityName: 'Farm HQ' },
    { structureId: 'st-305', structureType: 'Dry Room', structureName: 'Dry Room 1', facilityName: 'Farm HQ' },
    { structureId: 'st-402', structureType: 'Greenhouse', structureName: 'Greenhouse 4', facilityName: 'Geo B' },
  ],
  lowUtilizationStructures: [
    { structureId: 'st-101', structureType: 'Greenhouse', structureName: 'Greenhouse 1', facilityName: 'Farm HQ', occupancyRate: 0.25 },
    { structureId: 'st-102', structureType: 'Room', structureName: 'Room 1', facilityName: 'Farm HQ', occupancyRate: 0.5 },
  ],
  overCapacityStructures: [
    { structureId: 'st-901', structureType: 'Storage', structureName: 'Quarantine Storage', facilityName: 'Processing Plant', totalPlants: 250 },
  ],
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

  // Lifecycle
  if (path === '/lifecycle' && method === 'GET') {
    return jsonResponse(mockLifecycle);
  }

  // Licensing lifecycle events (mock)
  if (path === '/licensing/events' && method === 'GET') {
    return jsonResponse(mockLicensingEvents);
  }

  // Integrity (blockchain) - mock records
  if (path === '/integrity' && method === 'GET') {
    async function sha256HexStr(s: string): Promise<string> {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    const raw = [
      { id: 'blk-20001', type: 'plant', payload: { plantId: 'p-1002', strain: 'OG Kush', action: 'flip', at: daysAgo(39) } },
      { id: 'blk-20002', type: 'harvest', payload: { batchId: 'B-23-091', wetWeightKg: 182.4, at: daysAgo(10) } },
      { id: 'blk-20003', type: 'lab-result', payload: { batchId: 'B-23-091', lab: 'State Lab', result: 'pass', thcPct: 21.3, at: daysAgo(3) } },
      { id: 'blk-20004', type: 'transfer', payload: { batchId: 'B-23-091', to: 'Pharmacy West Indies Ltd.', manifestId: 'MAN-784-0091', at: daysAgo(1) } },
      { id: 'blk-20005', type: 'inspection', payload: { facility: 'Farm HQ', inspector: 'R. Louis', at: daysAgo(15), findings: 'minor' } },
      { id: 'blk-20006', type: 'lab-result', payload: { batchId: 'B-23-108', lab: 'Accredited Lab SLU', result: 'fail', test: 'Microbial', at: daysAgo(3) } },
      { id: 'blk-20007', type: 'lab-result', payload: { batchId: 'B-23-108', lab: 'Accredited Lab SLU', result: 'pass', test: 'Microbial', at: daysAgo(1) } },
      { id: 'blk-20008', type: 'license', payload: { licenseId: 'LIC-0099', holder: 'Ganja Co. Ltd.', action: 'renewed', until: '2026-06-30', at: daysAgo(20) } },
      { id: 'blk-20009', type: 'sanction', payload: { licenseId: 'LIC-0010', action: 'fined', amount: 5000, currency: 'XCD', reason: 'labeling non-compliance', at: daysAgo(8) } },
      { id: 'blk-20010', type: 'recall', payload: { product: 'Tincture 30ml', lot: 'LOT-2025-08-12', class: 'Class II', initiatedAt: daysAgo(4) } },
      { id: 'blk-20011', type: 'permit', payload: { permitId: 'IMP-0245', kind: 'import', holder: 'State Lab', substance: 'Reference Std.', validUntil: '2026-01-31', at: daysAgo(28) } },
      { id: 'blk-20012', type: 'permit', payload: { permitId: 'EXP-0311', kind: 'export', holder: 'Medical Distributor SLU', product: 'Flower', quantityKg: 50, at: daysAgo(6) } },
      { id: 'blk-20013', type: 'inventory-destruction', payload: { batchId: 'B-22-988', reason: 'mold', weightKg: 12.6, at: daysAgo(44) } },
      { id: 'blk-20014', type: 'fee-payment', payload: { licenseId: 'LIC-0099', type: 'renewal', amount: 10000, currency: 'XCD', receipt: 'RCPT-77341', at: daysAgo(21) } },
      { id: 'blk-20015', type: 'capa-closure', payload: { facility: 'Greenhouse 1', reference: 'CAPA-2025-07-15-02', status: 'closed', at: daysAgo(9) } },
      { id: 'blk-20016', type: 'shipment', payload: { manifestId: 'MAN-784-0110', route: 'SLU -> BBD', carrier: 'CaribCargo', sealed: true, at: daysAgo(0) } },
      { id: 'blk-20017', type: 'coa-chain', payload: { batchId: 'B-23-115', chainOfCustody: ['Farm HQ', 'Sampler A', 'State Lab'], at: daysAgo(2) } },
      { id: 'blk-20018', type: 'license', payload: { licenseId: 'LIC-0123', holder: 'Island Herbals Inc.', action: 'amended', fields: ['Address', 'Responsible Person'], at: daysAgo(13) } },
      { id: 'blk-20019', type: 'inspection', payload: { facility: 'Processing Plant', inspector: 'J. Henry', at: daysAgo(3), findings: 'none' } },
      { id: 'blk-20020', type: 'recall', payload: { product: 'Pre-roll 1g', lot: 'LOT-2025-07-29', class: 'Class I', closedAt: daysAgo(1) } },
      // Additional entries to enrich the blockchain view
      { id: 'blk-20021', type: 'sampling', payload: { facility: 'Greenhouse 2', sampler: 'K. Noel', at: daysAgo(11), batchId: 'B-23-104' } },
      { id: 'blk-20022', type: 'audit', payload: { scope: 'Traceability Records', facility: 'Farm HQ', at: daysAgo(16), outcome: 'satisfactory' } },
      { id: 'blk-20023', type: 'enforcement', payload: { licenseId: 'LIC-0010', action: 'warning-issued', at: daysAgo(7), reason: 'Late COA submission' } },
      { id: 'blk-20024', type: 'manifest-amend', payload: { manifestId: 'MAN-784-0091', fields: ['packages'], at: daysAgo(1) } },
      { id: 'blk-20025', type: 'recall-closure', payload: { product: 'Tincture 30ml', lot: 'LOT-2025-08-12', at: daysAgo(0), verifiedBy: 'Regulatory Officer T. Paul' } },
      { id: 'blk-20026', type: 'seed-import', payload: { permitId: 'IMP-0245', lot: 'SLU-SED-7855', quantity: 1200, at: daysAgo(30) } },
      { id: 'blk-20027', type: 'tag-assignment', payload: { plantId: 'p-1007', tag: 'RFID-77A91C', at: daysAgo(5) } },
      { id: 'blk-20028', type: 'waste-destruction', payload: { source: 'Trimming Waste', weightKg: 4.8, method: 'incineration', at: daysAgo(2) } },
      { id: 'blk-20029', type: 'transfer', payload: { batchId: 'B-23-108', to: 'Medical Distributor SLU', manifestId: 'MAN-784-0110', at: daysAgo(0) } },
      { id: 'blk-20030', type: 'lab-result', payload: { batchId: 'B-23-115', lab: 'State Lab', result: 'pending', tests: ['Potency'], at: daysAgo(2) } },
      { id: 'blk-20031', type: 'lab-result', payload: { batchId: 'B-23-115', lab: 'State Lab', result: 'pass', thcPct: 19.4, at: daysAgo(1) } },
      { id: 'blk-20032', type: 'license', payload: { licenseId: 'LIC-0200', holder: 'Pharmacy West Indies Ltd.', action: 'issued', until: '2027-09-01', at: daysAgo(60) } },
      { id: 'blk-20033', type: 'fee-payment', payload: { licenseId: 'LIC-0200', type: 'issuance', amount: 25000, currency: 'XCD', receipt: 'RCPT-88812', at: daysAgo(59) } },
      { id: 'blk-20034', type: 'permit', payload: { permitId: 'EXP-0312', kind: 'export', holder: 'Pharmacy West Indies Ltd.', product: 'Oil', quantityKg: 10, at: daysAgo(5) } },
      { id: 'blk-20035', type: 'inspection', payload: { facility: 'Outdoor Plot 1', inspector: 'M. Jean', at: daysAgo(6), findings: 'major', notes: 'Fence breach repaired' } },
      { id: 'blk-20036', type: 'capa-closure', payload: { facility: 'Outdoor Plot 1', reference: 'CAPA-2025-08-20-01', status: 'open', at: daysAgo(5) } },
      { id: 'blk-20037', type: 'capa-closure', payload: { facility: 'Outdoor Plot 1', reference: 'CAPA-2025-08-20-01', status: 'closed', at: daysAgo(2) } },
      { id: 'blk-20038', type: 'shipment', payload: { manifestId: 'MAN-784-0120', route: 'SLU -> ATG', carrier: 'InterIsle', sealed: true, at: daysAgo(2) } },
      { id: 'blk-20039', type: 'shipment', payload: { manifestId: 'MAN-784-0120', receivedAt: daysAgo(1), condition: 'intact', at: daysAgo(1) } },
      { id: 'blk-20040', type: 'inventory-destruction', payload: { batchId: 'B-23-091', reason: 'expired samples', weightKg: 0.9, at: daysAgo(0) } },
      { id: 'blk-20041', type: 'plant', payload: { plantId: 'p-1005', action: 'relocate', from: 'Room 3', to: 'Greenhouse 4', at: daysAgo(3) } },
      { id: 'blk-20042', type: 'plant', payload: { plantId: 'p-1006', action: 'harvested', by: 'Crew Field', at: daysAgo(12) } },
      { id: 'blk-20043', type: 'harvest', payload: { batchId: 'B-23-104', wetWeightKg: 160.2, at: daysAgo(9) } },
      { id: 'blk-20044', type: 'coa-chain', payload: { batchId: 'B-23-104', chainOfCustody: ['Farm HQ', 'Sampler B', 'Accredited Lab SLU'], at: daysAgo(8) } },
      { id: 'blk-20045', type: 'lab-result', payload: { batchId: 'B-23-104', lab: 'Accredited Lab SLU', result: 'pass', thcPct: 20.1, at: daysAgo(6) } },
      { id: 'blk-20046', type: 'transfer', payload: { batchId: 'B-23-104', to: 'Clinic North', manifestId: 'MAN-784-0125', at: daysAgo(5) } },
      { id: 'blk-20047', type: 'enforcement', payload: { licenseId: 'LIC-0010', action: 'sanction-lifted', at: daysAgo(0), reference: 'ENF-2025-08-15-01' } },
      { id: 'blk-20048', type: 'audit', payload: { scope: 'Security Systems', facility: 'Processing Plant', at: daysAgo(14), outcome: 'needs-improvement' } },
      { id: 'blk-20049', type: 'permit', payload: { permitId: 'IMP-0250', kind: 'import', holder: 'State Lab', substance: 'Calibration Gas', validUntil: '2026-02-28', at: daysAgo(18) } },
      { id: 'blk-20050', type: 'fee-payment', payload: { licenseId: 'LIC-0123', type: 'amendment', amount: 1500, currency: 'XCD', receipt: 'RCPT-90221', at: daysAgo(13) } },
    ];
    const withHashes = await Promise.all(
      raw.map(async (r) => ({ ...r, hash: await sha256HexStr(JSON.stringify(r.payload)) }))
    );
    return jsonResponse(withHashes);
  }

  // Inventory (read-only minimal)
  if (path === '/inventory' && method === 'GET') {
    return jsonResponse([
      { id: 'i-1', name: 'Nutrient A', category: 'Supplies', quantity: 5, unit: 'bottles', location: 'Room 1' },
    ]);
  }

  // Events
  if (path === '/events' && method === 'GET') {
    // Regulator calendar: generate ~500 events spread around today
    const base = new Date();
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T,>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];

  const eventTypes = [
      { type: 'inspection', prefix: 'Inspection' },
      { type: 'audit', prefix: 'Compliance Audit' },
      { type: 'sampling', prefix: 'Sampling' },
      { type: 'coa-due', prefix: 'COA Due' },
      { type: 'capa-review', prefix: 'Follow-up CAPA' },
      { type: 'enforcement', prefix: 'Enforcement Action' },
      { type: 'licence', prefix: 'License Checkpoint' },
      { type: 'recall', prefix: 'Recall Follow-up' },
  ] as const;

    const locations = [
      'Farm HQ', 'Greenhouse 1', 'Greenhouse 2', 'Greenhouse 3', 'Outdoor Plot 1', 'Processing Plant',
      'State Laboratory', 'Accredited Lab SLU', 'Authority HQ', 'Regulatory Office', 'Clinic North', 'Retail East'
    ];

    const batches = ['B-23-091', 'B-23-104', 'B-23-108', 'B-23-115', 'B-22-988'];

    const makeTitle = (t: string, prefix: string) => {
      if (t === 'inspection' || t === 'audit' || t === 'sampling') {
        return `${prefix}: ${pick(locations)}`;
      }
      if (t === 'coa-due' || t === 'recall') {
        return `${prefix}: Batch ${pick(batches)}`;
      }
      if (t === 'enforcement') {
        return `${prefix} Review`;
      }
      if (t === 'capa-review') {
        return `${prefix}`;
      }
      if (t === 'licence') {
        return 'License Renewal Checkpoint';
      }
      return prefix;
    };

    const items: Array<{ id: number; title: string; eventType: string; startDate: string; location?: string }> = [];
    const total = 500;
    for (let i = 0; i < total; i++) {
  const et = pick<typeof eventTypes[number]>(eventTypes);
      const offsetDays = rand(-180, 180);
      const dt = new Date(base);
      dt.setDate(base.getDate() + offsetDays);
      // Slightly randomize time of day to vary rendering
      dt.setHours(rand(8, 17), [0, 15, 30, 45][rand(0, 3)], 0, 0);
      const location = pick(locations);
      items.push({
        id: 1001 + i,
        title: makeTitle(et.type, et.prefix),
        eventType: et.type,
        startDate: dt.toISOString(),
        location,
      });
    }
    // Keep deterministic-ish ordering by date
    items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return jsonResponse(items);
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
  getLicensingEvents() {
  return fetchJson(`/licensing/events`).then((r) => r.json());
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
