import React, { useEffect, useMemo, useState, useRef } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
import { Sprout, Map as MapIcon, Layers, ChevronRight, ChevronLeft, Info, ChevronDown, Plus, MapPin, Settings } from 'lucide-react';

type Plant = {
  id: string;
  strain: string;
  location: string; // e.g., "Indoor Room 1 - Rack 3" or "Greenhouse 2 - Bed 7"
  plantedAt: string;
  harvested?: boolean;
};

type Sublocation = {
  key: string; // e.g., Rack 3
  type: 'rack' | 'bed' | 'tent' | 'table' | 'shelf' | 'zone' | 'other';
  plants: Plant[];
};

type TopLocation = {
  key: string; // e.g., Indoor Room 1
  type: 'room' | 'greenhouse' | 'other';
  sublocations: Record<string, Sublocation>;
  plants: Plant[]; // plants without a parsed sublocation
};

function parseTopType(name: string): 'room' | 'greenhouse' | 'other' {
  if (/^Indoor Room /i.test(name)) return 'room';
  if (/^Greenhouse /i.test(name)) return 'greenhouse';
  return 'other';
}

function parseSubType(name: string): Sublocation['type'] {
  const lower = name.toLowerCase();
  if (lower.startsWith('rack')) return 'rack';
  if (lower.startsWith('bed')) return 'bed';
  if (lower.startsWith('tent')) return 'tent';
  if (lower.includes('shelf')) return 'shelf';
  if (lower.includes('table')) return 'table';
  if (lower.includes('zone')) return 'zone';
  return 'other';
}

function buildLocations(plants: Plant[]): Record<string, TopLocation> {
  const map: Record<string, TopLocation> = {};
  for (const p of plants) {
    const [top, sub] = p.location.split(' - ');
    const topKey = top?.trim() || 'Unknown Location';
    if (!map[topKey]) {
      map[topKey] = { key: topKey, type: parseTopType(topKey), sublocations: {}, plants: [] };
    }
    if (sub) {
      const subKey = sub.trim();
      if (!map[topKey].sublocations[subKey]) {
        map[topKey].sublocations[subKey] = { key: subKey, type: parseSubType(subKey), plants: [] };
      }
      map[topKey].sublocations[subKey].plants.push(p);
    } else {
      map[topKey].plants.push(p);
    }
  }
  return map;
}

function categoryTitle(t: TopLocation['type']): 'Indoor' | 'Outdoor' | 'Other' {
  if (t === 'room') return 'Indoor';
  if (t === 'greenhouse') return 'Outdoor';
  return 'Other';
}

function subCategoryTitle(t: TopLocation['type']): 'Room' | 'Greenhouse' | '' {
  if (t === 'room') return 'Room';
  if (t === 'greenhouse') return 'Greenhouse';
  return '';
}

function formatTopKeyDisplay(key: string, type: TopLocation['type']) {
  const parts = key.split(' - ');
  let left = parts[0] || '';
  if (type === 'room') {
    left = left.replace(/^Indoor\s+/i, '');
  }
  // For greenhouse we keep the original left (e.g., "Greenhouse 2")
  if (parts.length >= 2) return `${left} - ${parts.slice(1).join(' - ')}`;
  return left || key;
}

function prettyLocationString(location: string) {
  const parts = location.split(' - ');
  if (parts.length === 0) return location;
  parts[0] = parts[0].replace(/^Indoor\s+/i, '');
  return parts.join(' - ');
}

type FacilityType = 'building' | 'farm';
function getFacilityName(topKey: string): string {
  const parts = topKey.split(' - ');
  return (parts[1] || 'Unknown').trim();
}
function facilityTypeOfTop(t: TopLocation['type']): FacilityType | null {
  if (t === 'room') return 'building';
  if (t === 'greenhouse') return 'farm';
  return null;
}
function leftNameFromTop(topKey: string, type: TopLocation['type']): string {
  const left = (topKey.split(' - ')[0] || '').trim();
  return type === 'room' ? left.replace(/^Indoor\s+/i, '') : left;
}

export default function Sites() {
  const { activeModule } = useModule();
  // Ref to equipment pane for scrollIntoView
  const equipmentRef = useRef<HTMLDivElement>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  
  // Sliding column navigation state
  const [columnOffset, setColumnOffset] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  // (Removed duplicate modal state declarations and unused updateWindow)
  type Geo = { id: string; name: string; address?: string; lat?: number; lng?: number };
  type Facility = { id: string; name: string; type: 'farm' | 'building'; geo: { id: string } };
  const [geoList, setGeoList] = useState<Geo[]>([]);
  const [facilityList, setFacilityList] = useState<Facility[]>([]);
  // Cache facilities per geo to show counts without extra clicks
  const [facilitiesByGeo, setFacilitiesByGeo] = useState<Record<string, Facility[]>>({});
  // Removed Add Location wizard and draft preview
  const [expandedTop, setExpandedTop] = useState<Record<string, boolean>>({});
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  // Removed Unassigned from Areas UI

  // Simple error helper to surface network issues
  const showError = (e: any) => {
    const msg = e?.message ? String(e.message) : 'Unknown error';
    alert(`Request failed. Please ensure the API is running and reachable.\n\nDetails: ${msg}`);
  };

  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getPlants().then(setPlants);
    } else {
      setPlants([]);
    }
    setSelectedTop(null);
    setSelectedSub(null);
    setSelectedPlant(null);
  }, [activeModule]);

  // Load geolocations on mount/when module is cannabis
  useEffect(() => {
    if (activeModule !== 'cannabis') return;
    (async () => {
      try {
        const gs = await api.getGeos();
        setGeoList(gs);
      } catch {
        setGeoList([]);
      }
    })();
  }, [activeModule]);

  // When a geolocation is selected, load its facilities
  useEffect(() => {
    if (!selectedGeo) {
      setFacilityList([]);
      return;
    }
    (async () => {
      try {
        const fs = await api.getFacilities(selectedGeo);
        setFacilityList(fs);
  // also cache in facilitiesByGeo for counts
  setFacilitiesByGeo((prev) => ({ ...prev, [selectedGeo]: fs }));
      } catch {
        setFacilityList([]);
      }
    })();
  }, [selectedGeo]);

  // When a facility is selected, load its structures
  useEffect(() => {
    if (!selectedFacility) return;
    (async () => {
      try {
        const list = await api.getStructures(selectedFacility);
        const mapped = list.map((s: any) => ({ 
          id: s.id, 
          facility: s.facility?.id, 
          name: s.name, 
          type: s.type, 
          size: s.size,
          usage: s.usage,
          tents: s.tents,
          racks: s.racks
        }));
        // Merge with any structures from other facilities
        setStructureList((prev: any[]) => {
          const others = prev.filter((x) => x.facility !== selectedFacility);
          return [...others, ...mapped];
        });
      } catch {
        // no-op
      }
    })();
  }, [selectedFacility]);

  

  const locations = useMemo(() => buildLocations(plants.filter((p) => !p.harvested)), [plants]);
  // Derive geolocations from the first segment before first comma in facility name if available, else use full facility name.
  // Geolocations come from local storage only (empty state supported)
  const geos = useMemo(() => geoList.sort((a,b)=> a.name.localeCompare(b.name)), [geoList]);
  const facilitiesForGeo = useMemo(() => {
    if (!selectedGeo) return [] as Facility[];
    return facilityList.filter(f => f.geo?.id === selectedGeo).sort((a,b)=> a.name.localeCompare(b.name));
  }, [facilityList, selectedGeo]);
  
  // Prefetch facilities for all geos so counters are populated
  useEffect(() => {
    if (geos.length === 0) return;
    (async () => {
      try {
        const entries = await Promise.all(
          geos.map(async (g) => {
            try {
              const fs = await api.getFacilities(g.id);
              return [g.id, fs] as const;
            } catch {
              return [g.id, []] as const;
            }
          })
        );
        setFacilitiesByGeo((prev) => {
          const next = { ...prev } as Record<string, Facility[]>;
          for (const [gid, fs] of entries) next[gid] = fs;
          return next;
        });
      } catch {
        // ignore
      }
    })();
  }, [geos]);

  // Prefetch structures for all facilities in current geolocation so facility counters show immediately
  useEffect(() => {
    if (facilitiesForGeo.length === 0) return;
    (async () => {
      const ids = facilitiesForGeo.map((f) => f.id);
      try {
        const lists = await Promise.all(
          ids.map(async (fid) => {
            try {
              const list = await api.getStructures(fid);
              return list.map((s: any) => ({ 
                id: s.id, 
                facility: s.facility?.id, 
                name: s.name, 
                type: s.type, 
                size: s.size,
                usage: s.usage,
                tents: s.tents,
                racks: s.racks
              }));
            } catch {
              return [] as any[];
            }
          })
        );
        const flattened = ([] as any[]).concat(...lists);
        setStructureList((prev: any[]) => {
          const toExclude = new Set(ids);
          const others = prev.filter((x) => !toExclude.has(x.facility));
          return [...others, ...flattened];
        });
      } catch {
        // ignore
      }
    })();
  }, [facilitiesForGeo]);

  // Load equipment data when module is cannabis
  useEffect(() => {
    if (activeModule !== 'cannabis') return;
    (async () => {
      try {
        const equipment = await api.getEquipment();
        setEquipmentList(equipment);
      } catch (e) {
        console.error('Failed to load equipment:', e);
        setEquipmentList([]);
      }
    })();
  }, [activeModule]);

  // Modals state
  const [geoModalOpen, setGeoModalOpen] = useState(false);
  const [geoForm, setGeoForm] = useState<{ name: string; address: string; lat?: number; lng?: number }>({ name: '', address: '' });
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [facilityForm, setFacilityForm] = useState<{ name: string; type: 'farm' | 'building' }>({ name: '', type: 'farm' });
  // Structures (per facility)
  type Structure = { id?: string; facility: string; type: 'room' | 'greenhouse'; name: string; size?: number; usage?: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents'; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> };
  const loadStructures = (): Structure[] => {
    try { return JSON.parse(localStorage.getItem('mvp.structures') || '[]'); } catch { return []; }
  };
  const [structureList, setStructureList] = useState<Structure[]>(loadStructures);
  const persistStructures = (arr: Structure[]) => { setStructureList(arr); localStorage.setItem('mvp.structures', JSON.stringify(arr)); };
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  
  // Equipment state
  type Equipment = { 
    id: string; 
    type: string; 
    subtype: string; 
    details: Record<string, string>; 
    location: string; 
    iotDevice?: string; 
    createdAt: string; 
  };
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  
  // Equipment modal state
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [equipForm, setEquipForm] = useState<{ 
    name: string; 
    category: string; 
    type: string; 
    power: string; 
    specification: string; 
    location: string; 
    description: string; 
    iotDevice: string;
  }>({ 
    name: '', 
    category: '', 
    type: '', 
    power: '', 
    specification: '', 
    location: '', 
    description: '',
    iotDevice: ''
  });
  const [iotScanning, setIotScanning] = useState(false);
  const [iotDevices, setIotDevices] = useState<Array<{id: string; name: string; type: string; signal: number}>>([]);
  const [structureForm, setStructureForm] = useState<{ name: string; type: 'room' | 'greenhouse'; size: string; usage: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents' | ''; tents: Array<{ widthFt: string; lengthFt: string }>; racks: Array<{ widthCm: string; lengthCm: string; shelves: string }> }>({ name: '', type: 'room', size: '', usage: '', tents: [], racks: [] });
  // Structures available for the currently selected facility
  const topsForFacility = useMemo(() => {
    if (!selectedFacility) return [] as TopLocation[];
    const local = structureList
      .filter(s => s.facility === selectedFacility)
      .map<TopLocation>((s) => {
        const leftBase = s.type === 'room'
          ? `Indoor ${s.name.replace(/^Indoor\s+/i, '')}`
          : (s.name.match(/^Greenhouse\s+/i) ? s.name : `Greenhouse ${s.name.replace(/^Greenhouse\s+/i, '')}`);
        const facilityName = facilityList.find(f => f.id === selectedFacility)?.name || '';
        const key = `${leftBase} - ${facilityName}`;
        return { key, type: s.type, sublocations: {}, plants: [] };
      });
    return local.sort((a,b)=> leftNameFromTop(a.key, a.type).localeCompare(leftNameFromTop(b.key, b.type)));
  }, [structureList, selectedFacility]);
  const topList = useMemo(() => Object.values(locations).sort((a, b) => a.key.localeCompare(b.key)), [locations]);
  const subList = useMemo(() => {
    if (!selectedTop) return [] as Sublocation[];
    return Object.values(locations[selectedTop]?.sublocations || {}).sort((a, b) => a.key.localeCompare(b.key));
  }, [locations, selectedTop]);

  // Get current structure data for equipment location options
  const currentStructure = useMemo(() => {
    if (!selectedTop || !selectedFacility) return null;
    const found = structureList.find(s => {
      const structureName = s.type === 'room'
        ? `Indoor ${s.name.replace(/^Indoor\s+/i, '')}`
        : (s.name.match(/^Greenhouse\s+/i) ? s.name : `Greenhouse ${s.name.replace(/^Greenhouse\s+/i, '')}`);
      const facilityName = facilityList.find(f => f.id === selectedFacility)?.name || '';
      const key = `${structureName} - ${facilityName}`;
      return key === selectedTop;
    });
    return found;
  }, [selectedTop, selectedFacility, structureList, facilityList]);

  if (activeModule !== 'cannabis') {
    return (
      <Card>
        <p className="text-sm text-gray-700">Plants for {activeModule} are not yet implemented in this MVP.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <MapIcon className="h-6 w-6" aria-hidden /> Sites
        </h1>
      </div>

      {/* Compact selectors for small/medium screens */}
      <div className="xl:hidden">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Geolocation</span>
              <select
                className="text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={selectedGeo || ''}
                onChange={(e) => { const v = e.target.value || null; setSelectedGeo(v); setSelectedFacility(null); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }}
              >
                <option value="">Select…</option>
                {geos.map((g)=> (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Facility</span>
              <select
                className="text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={selectedFacility || ''}
                onChange={(e) => { const v = e.target.value || null; setSelectedFacility(v); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }}
                disabled={!selectedGeo}
              >
                <option value="">Select…</option>
                {facilitiesForGeo.map((f)=> (
                  <option key={f.id} value={f.id}>{f.name} · {f.type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Location</span>
              <select
                className="text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={selectedTop || ''}
                onChange={(e) => { const v = e.target.value || null; setSelectedTop(v); setSelectedSub(null); setSelectedPlant(null); }}
                disabled={!selectedFacility}
              >
                <option value="">Select…</option>
                {topsForFacility.map((t)=> (
                  <option key={t.key} value={t.key}>{formatTopKeyDisplay(t.key, t.type)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-sm text-gray-600">Area</span>
              <select
                className="text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={selectedSub || ''}
                onChange={(e) => { const v = e.target.value || null; setSelectedSub(v || null); setSelectedPlant(null); }}
                disabled={!selectedTop}
              >
                <option value="">Select…</option>
                {selectedTop && (
                  Object.values(locations[selectedTop]?.sublocations || {})
                    .sort((a,b)=> a.key.localeCompare(b.key))
                    .map((s)=> (
                      <option key={s.key} value={s.key}>{s.key}</option>
                    ))
                )}
              </select>
            </div>
          </div>
        </Card>
      </div>

  <div className="grid gap-4 items-start grid-cols-1 md:[grid-template-columns:280px_minmax(0,1fr)] lg:[grid-template-columns:1fr_1fr_1fr]">{/* Maximum 3 columns using balanced width */}
  {/* Pane 1: Geolocations - Show when columnOffset is 0 */}
  {columnOffset === 0 && (
  <Card className="hidden lg:block">
          <div className="w-full min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-gray-900">Geolocations</h2>
              <button
                className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                aria-label="Add geolocation"
                onClick={() => setGeoModalOpen(true)}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {geos.length > 0 ? (
              <div>
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {geos.map((g) => (
                    <li key={g.id}>
                      <button
                        className={`w-full text-left px-3 py-2 flex items-center justify-between ${selectedGeo === g.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                        onClick={() => { 
                          setSelectedGeo(g.id); 
                          setSelectedFacility(null); 
                          setSelectedTop(null); 
                          setSelectedSub(null); 
                          setSelectedPlant(null); 
                          setSelectedEquipment(null);
                          setColumnOffset(0);
                        }}
                      >
                        <div className="min-w-0">
                          <div className="text-base text-gray-900 truncate">{g.name}</div>
                          <div className="text-sm text-gray-500">{(facilitiesByGeo[g.id] || []).length} facilities</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-base text-gray-700">No geolocations</div>
            )}
          </div>
        </Card>
  )}

        {/* Pane 2: Areas within selected location */}
        {/* Pane 2: Facilities for selected geolocation - Show when columnOffset is 0 or 1 */}
        {selectedGeo && (columnOffset === 0 || columnOffset === 1) && (
          <Card className="hidden lg:block">
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-gray-900">Facilities</h2>
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                  aria-label="Add facility"
                  onClick={() => { setFacilityForm({ name: '', type: 'farm' }); setFacilityModalOpen(true); }}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {facilitiesForGeo.map((f)=> (
            <li key={f.id}>
              <button
                className={`w-full text-left px-3 py-2 flex items-center justify-between ${selectedFacility === f.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                onClick={() => { 
                  setSelectedFacility(f.id); 
                  setSelectedTop(null); 
                  setSelectedSub(null); 
                  setSelectedPlant(null); 
                  setSelectedEquipment(null);
                  setColumnOffset(0);
                }}
              >
                <div className="min-w-0">
                  <div className="text-base text-gray-900 truncate">{f.name} <span className="text-sm text-gray-500">· {f.type}</span></div>
                  <div className="text-sm text-gray-500">{structureList.filter((s:any) => s.facility === f.id).length} structures</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
              </button>
            </li>
          ))}
          {facilitiesForGeo.length === 0 && (
            <li className="px-3 py-2 text-base text-gray-500">No facilities.</li>
          )}
        </ul>
      </div>
    </Card>
  )}

        {/* Pane 3: Structures (Rooms/Greenhouses) within selected facility - Show when columnOffset is 0 or 1 */}
        {selectedFacility && (columnOffset === 0 || columnOffset === 1) && (
      <Card className="hidden lg:block">
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-medium text-gray-900">Structures</h2>
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                  aria-label="Add structure"
                  onClick={() => {
                    const f = facilityList.find((x)=> x.id === selectedFacility);
                    const defType: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                    setStructureForm({ name: '', type: defType, size: '', usage: '' as any, tents: [], racks: [] });
                    setStructureModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {(() => {
                const tops = topsForFacility;
                return tops.length > 0 ? (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    {tops.map((loc) => {
                      const subs = Object.values(loc.sublocations);
                      // Count real equipment for this structure
                      const equipmentCount = equipmentList.filter(eq => 
                        eq.location.startsWith(loc.key)
                      ).length;
                      const active = selectedTop === loc.key;
                      const subsTyped = subs.map((s) => s.type);
                      const countBy = (t: Sublocation['type']) => subsTyped.filter((x) => x === t).length;
                      const tents = countBy('tent');
                      const racks = countBy('rack');
                      const beds = countBy('bed');
                      const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
                      const summary = (() => {
                        if (loc.type === 'room') {
                          const parts: string[] = [];
                          if (tents > 0) parts.push(plural(tents, 'tent'));
                          if (racks > 0) parts.push(plural(racks, 'rack'));
                          parts.push(plural(equipmentCount, 'equipment'));
                          return parts.join(' . ');
                        }
                        if (loc.type === 'greenhouse') {
                          const parts: string[] = [];
                          if (beds > 0) parts.push(plural(beds, 'bed'));
                          parts.push(plural(equipmentCount, 'equipment'));
                          return parts.join(' . ');
                        }
                        return `${subs.length} areas . ${plural(equipmentCount, 'equipment')}`;
                      })();
                      return (
                        <li key={loc.key}>
                          <button
                            className={`w-full text-left px-3 py-2 flex items-center justify-between ${active ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              if (selectedEquipment && selectedTop === loc.key) {
                                // If equipment is shown and clicking same structure, go back to structure view
                                setSelectedEquipment(null);
                                setColumnOffset(0);
                              } else {
                                // First click or different structure - show equipment
                                setSelectedTop(loc.key);
                                setSelectedSub(null);
                                setSelectedPlant(null);
                                setSelectedEquipment(loc.key + '-equipment'); // Mock equipment selection
                                setColumnOffset(1); // Advance to show equipment column
                                // Scroll to equipment column
                                setTimeout(() => {
                                  equipmentRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
                                }, 50);
                              }
                            }}
                          >
                            <div className="min-w-0">
                              <div className="text-base text-gray-900 truncate">{leftNameFromTop(loc.key, loc.type)}</div>
                              <div className="text-sm text-gray-500">{summary}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-base text-gray-700">No structures.</div>
                );
              })()}
            </div>
          </Card>
  )}

        {/* Pane 4: Equipment within selected room - Show when columnOffset is 1 */}
        {selectedEquipment && columnOffset === 1 && (
          <div ref={equipmentRef} className="hidden lg:block">
            <Card>
              <div className="w-full min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-medium text-gray-900">Equipment</h2>
                  <button
                    className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    aria-label="Add equipment"
                    onClick={() => setEquipModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {(() => {
                  // Get equipment for the selected structure
                  const structureEquipment = equipmentList.filter(eq => 
                    eq.location.startsWith(selectedTop || '')
                  );
                  
                  return structureEquipment.length > 0 ? (
                    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                      {structureEquipment.map((equipment) => (
                        <li key={equipment.id} className="px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-base text-gray-900 truncate">
                                {equipment.details.Name || `${equipment.type} ${equipment.subtype}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {equipment.type} → {equipment.subtype}
                                {equipment.details.Power && ` → ${equipment.details.Power}W`}
                                {equipment.details.Specification && ` → ${equipment.details.Specification}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {equipment.location.split(' → ').slice(1).join(' → ')}
                                {equipment.iotDevice && ` • IoT: ${equipment.iotDevice}`}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">No equipment</div>
                  );
                })()}
              </div>
            </Card>
          </div>
        )}

  {/* Details panel (third visible column when a plant is selected; first column hides via earlier logic) */}
  {selectedPlant && (
        <div className="w-full min-w-0">
          <PlantDetailsView plant={selectedPlant} onBack={() => setSelectedPlant(null)} />
        </div>
      )}
      </div>

      {/* Geolocation Modal */}
      {geoModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="text-base font-semibold text-gray-900">Add geolocation</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name *</label>
                <input 
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !geoForm.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  value={geoForm.name} 
                  onChange={(e)=> setGeoForm(v=>({...v, name: e.target.value}))} 
                  placeholder="e.g., Munich HQ"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Address</label>
                <input className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={geoForm.address} onChange={(e)=> setGeoForm(v=>({...v, address: e.target.value}))} placeholder="Street, City…"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Pick on map (mock)</label>
                <div className="h-48 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center text-sm text-gray-500">Map mock</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700" onClick={()=> setGeoModalOpen(false)}>Cancel</button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!geoForm.name.trim()}
                onClick={async ()=>{
                  try {
                    const created = await api.createGeo({ name: geoForm.name.trim(), address: geoForm.address.trim() });
                    const gs = await api.getGeos();
                    setGeoList(gs);
                    setSelectedGeo(created.id);
                    setSelectedFacility(null);
                    setSelectedTop(null);
                    setSelectedSub(null);
                    setSelectedPlant(null);
                    setSelectedEquipment(null);
                    setColumnOffset(0);
                    setGeoModalOpen(false);
                    setGeoForm({ name: '', address: '' });
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facility Modal */}
      {facilityModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="text-base font-semibold text-gray-900">Add facility</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type *</label>
                <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={facilityForm.type} onChange={(e)=> setFacilityForm(v=>({...v, type: e.target.value as any}))}>
                  <option value="farm">Farm</option>
                  <option value="building">Building</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name *</label>
                <input 
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !facilityForm.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  value={facilityForm.name} 
                  onChange={(e)=> setFacilityForm(v=>({...v, name: e.target.value}))} 
                  placeholder="e.g., North Farm or Building A"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700" onClick={()=> setFacilityModalOpen(false)}>Cancel</button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!selectedGeo || !facilityForm.name.trim()}
                onClick={async ()=>{
                  if (!selectedGeo) return;
                  try {
                    const created = await api.createFacility({ geoId: selectedGeo, name: facilityForm.name.trim(), type: facilityForm.type });
                    const fs = await api.getFacilities(selectedGeo);
                    setFacilityList(fs);
                    setSelectedFacility(created.id);
                    setSelectedTop(null);
                    setSelectedSub(null);
                    setSelectedPlant(null);
                    setSelectedEquipment(null);
                    setColumnOffset(0);
                    setFacilityModalOpen(false);
                    setFacilityForm({ name: '', type: 'farm' });
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structure Modal */}
      {structureModalOpen && selectedFacility && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="text-base font-semibold text-gray-900">Add structure</h3>
            </div>
            <div className="space-y-3">
              {(() => {
                // selectedFacility holds the facility id; match by id
                const f = facilityList.find((x)=> x.id === selectedFacility);
                const allowed: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                // Ensure form type always matches allowed
                if (structureForm.type !== allowed) {
                  setStructureForm((v)=> ({ ...v, type: allowed }));
                }
                return (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base bg-gray-50"
                      value={allowed}
                      disabled
                    >
                      <option value={allowed}>{allowed === 'room' ? 'Room' : 'Greenhouse'}</option>
                    </select>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name *</label>
                {(() => {
                  const f = facilityList.find((x)=> x.id === selectedFacility);
                  const allowed: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                  const ph = allowed === 'room' ? 'e.g., Room 1' : 'e.g., Greenhouse 2';
                  return (
                    <input
                      className={`w-full border rounded-md px-2 py-1.5 text-base ${
                        !structureForm.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={structureForm.name}
                      onChange={(e)=> setStructureForm((v)=> ({ ...v, name: e.target.value }))}
                      placeholder={ph}
                    />
                  );
                })()}
              </div>
              {/* Size first (always above Usage) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Size (m²) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !structureForm.size || isNaN(Number(structureForm.size)) || Number(structureForm.size) <= 0
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  value={structureForm.size}
                  onChange={(e)=> setStructureForm((v)=> ({ ...v, size: e.target.value }))}
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Usage *</label>
                {(() => {
                  const f = facilityList.find((x)=> x.id === selectedFacility);
                  const allowed: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                    const options = allowed === 'greenhouse' ? ['Vegetative','Flowering'] : ['Vegetative','Flowering','Drying','Storage','Racks/Tents'];
                  // Ensure selection remains valid when allowed changes
                  if (structureForm.usage && !options.includes(structureForm.usage)) {
                    setStructureForm((v)=> ({ ...v, usage: '' as any, tents: [], racks: [] }));
                  }
                  return (
                    <select
                      className={`w-full border rounded-md px-2 py-1.5 text-base ${
                        !structureForm.usage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={structureForm.usage}
                      onChange={(e)=> {
                        const next = e.target.value as any;
                        setStructureForm((v)=> ({ ...v, usage: next, tents: next === 'Racks/Tents' ? (v.tents || []) : [], racks: next === 'Racks/Tents' ? (v.racks || []) : [] }));
                      }}
                    >
                      <option value="">Select…</option>
                      {options.map(o => (
                        <option key={o} value={o as any}>{o}</option>
                      ))}
                    </select>
                  );
                })()}
                {/* helper text removed as requested */}
              </div>
              {/* Racks/Tents editor when usage is Racks/Tents and type is room */}
              {(() => {
                const f = facilityList.find((x)=> x.id === selectedFacility);
                const allowed: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                if (allowed !== 'room' || structureForm.usage !== 'Racks/Tents') return null;
                // Helper to compute total tent+rack area in m^2
                const ft2m = (ft: number) => ft * 0.3048;
                const tentAreaM2 = (w: number, l: number) => ft2m(w) * ft2m(l);
                const totalTentM2 = (structureForm.tents || []).reduce((sum, t) => sum + (tentAreaM2(Number(t.widthFt||0), Number(t.lengthFt||0)) || 0), 0);
                const cm2m = (cm: number) => cm / 100;
                const rackAreaM2 = (wcm: number, lcm: number) => cm2m(wcm) * cm2m(lcm);
                const totalRackM2 = (structureForm.racks || []).reduce((sum, r) => sum + (rackAreaM2(Number(r.widthCm||0), Number(r.lengthCm||0)) || 0), 0);
                const roomM2 = Number(structureForm.size || '0') || 0;
                const over = (totalTentM2 + totalRackM2) > roomM2 + 1e-6;
                return (
                  <div className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-gray-700">Racks/Tents for this room</label>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5"
                        onClick={() => setStructureForm(v => ({ ...v, tents: [...(v.tents || []), { widthFt: '', lengthFt: '' }] }))}
                      >
                        Add tent (ft × ft)
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(structureForm.tents || []).map((t, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Tent {ti+1}</span>
                          <input
                            className={`w-20 rounded-md focus:ring-primary focus:border-primary ${
                              !t.widthFt || isNaN(Number(t.widthFt)) || Number(t.widthFt) <= 0 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder="Width ft"
                            inputMode="numeric"
                            value={t.widthFt}
                            onChange={(e)=> setStructureForm(v => ({ ...v, tents: v.tents.map((x,i)=> i===ti ? { ...x, widthFt: e.target.value } : x) }))}
                          />
                          <span className="text-gray-500">×</span>
                          <input
                            className={`w-20 rounded-md focus:ring-primary focus:border-primary ${
                              !t.lengthFt || isNaN(Number(t.lengthFt)) || Number(t.lengthFt) <= 0 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder="Length ft"
                            inputMode="numeric"
                            value={t.lengthFt}
                            onChange={(e)=> setStructureForm(v => ({ ...v, tents: v.tents.map((x,i)=> i===ti ? { ...x, lengthFt: e.target.value } : x) }))}
                          />
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() => setStructureForm(v => ({ ...v, tents: v.tents.filter((_,i)=> i!==ti) }))}
                          >Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 mb-2">
                      <label className="block text-sm text-gray-700">Add rack (cm × cm + shelves)</label>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5"
                        onClick={() => setStructureForm(v => ({ ...v, racks: [...(v.racks || []), { widthCm: '', lengthCm: '', shelves: '' }] }))}
                      >
                        Add rack
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(structureForm.racks || []).map((r, ri) => (
                        <div key={ri} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Rack {ri+1}</span>
                          <input
                            className={`w-24 rounded-md focus:ring-primary focus:border-primary ${
                              !r.widthCm || isNaN(Number(r.widthCm)) || Number(r.widthCm) <= 0 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder="Width cm"
                            inputMode="numeric"
                            value={r.widthCm}
                            onChange={(e)=> setStructureForm(v => ({ ...v, racks: v.racks.map((x,i)=> i===ri ? { ...x, widthCm: e.target.value } : x) }))}
                          />
                          <span className="text-gray-500">×</span>
                          <input
                            className={`w-24 rounded-md focus:ring-primary focus:border-primary ${
                              !r.lengthCm || isNaN(Number(r.lengthCm)) || Number(r.lengthCm) <= 0 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder="Length cm"
                            inputMode="numeric"
                            value={r.lengthCm}
                            onChange={(e)=> setStructureForm(v => ({ ...v, racks: v.racks.map((x,i)=> i===ri ? { ...x, lengthCm: e.target.value } : x) }))}
                          />
                          <span className="text-gray-500">·</span>
                          <input
                            className={`w-24 rounded-md focus:ring-primary focus:border-primary ${
                              !r.shelves || isNaN(Number(r.shelves)) || Number(r.shelves) <= 0 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder="# Shelves"
                            inputMode="numeric"
                            value={r.shelves}
                            onChange={(e)=> setStructureForm(v => ({ ...v, racks: v.racks.map((x,i)=> i===ri ? { ...x, shelves: e.target.value } : x) }))}
                          />
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() => setStructureForm(v => ({ ...v, racks: v.racks.filter((_,i)=> i!==ri) }))}
                          >Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-2 text-xs ${over ? 'text-red-600' : 'text-gray-600'}`}>
                      Total area (tents+racks): {(totalTentM2 + totalRackM2).toFixed(2)} m² {roomM2 ? `(room: ${roomM2.toFixed(2)} m²)` : ''}
                      {over && <span className="ml-2">Exceeds room size</span>}
                    </div>
                  </div>
                );
              })()}
              
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700" onClick={()=> setStructureModalOpen(false)}>Cancel</button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!structureForm.name.trim() || !structureForm.size || isNaN(Number(structureForm.size)) || Number(structureForm.size) <= 0 || !structureForm.usage || (structureForm.usage === 'Racks/Tents' && (()=>{
                  const ft2m = (ft:number)=> ft*0.3048; const areaT = (w:number,l:number)=> ft2m(w)*ft2m(l);
                  const totalT = (structureForm.tents||[]).reduce((s,t)=> s + areaT(Number(t.widthFt||0), Number(t.lengthFt||0)), 0);
                  const cm2m = (cm:number)=> cm/100; const areaR = (w:number,l:number)=> cm2m(w)*cm2m(l);
                  const totalR = (structureForm.racks||[]).reduce((s,r)=> s + areaR(Number(r.widthCm||0), Number(r.lengthCm||0)), 0);
                  const room = Number(structureForm.size||'0')||0; return totalT + totalR > room + 1e-6;
                })())}
                onClick={async ()=>{
                  if (!selectedFacility) return;
                  try {
                    const name = structureForm.name.trim();
                    // Enforce allowed type based on facility kind
                    const f = facilityList.find((x)=> x.id === selectedFacility);
                    const allowedType: 'room' | 'greenhouse' = (f?.type === 'building') ? 'room' : 'greenhouse';
                    const type = allowedType;
                    const sizeNum = Number(structureForm.size);
                    const tents = structureForm.usage === 'Racks/Tents' ? (structureForm.tents||[]).map(t => ({ widthFt: Number(t.widthFt||0), lengthFt: Number(t.lengthFt||0) })) : undefined;
                    const racks = structureForm.usage === 'Racks/Tents' ? (structureForm.racks||[]).map(r => ({ widthCm: Number(r.widthCm||0), lengthCm: Number(r.lengthCm||0), shelves: Number(r.shelves||0) })) : undefined;
                    await api.createStructure({ facilityId: selectedFacility, name, type, size: isNaN(sizeNum) ? 0 : sizeNum, usage: structureForm.usage as any, tents, racks });
                    const list = await api.getStructures(selectedFacility);
                    setStructureList(list.map((s: any) => ({ id: s.id, facility: s.facility?.id, name: s.name, type: s.type, size: s.size, usage: s.usage, tents: s.tents, racks: s.racks })));
                    setStructureModalOpen(false);
                    setStructureForm({ name: '', type: 'room', size: '', usage: '' as any, tents: [], racks: [] });
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {equipModalOpen && selectedTop && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[640px] max-w-[95vw] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="text-base font-semibold text-gray-900">Add equipment to {selectedTop}</h3>
            </div>
            <div className="space-y-3">
              {/* Equipment Category */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Equipment Category *</label>
                <select 
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !equipForm.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  value={equipForm.category}
                  onChange={(e) => {
                    setEquipForm(v => ({...v, category: e.target.value, type: '', power: '', specification: ''}));
                  }}
                >
                  <option value="">Select category...</option>
                  <option value="lighting">Lighting</option>
                  <option value="ventilation">Ventilation</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="climate-control">Climate Control</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Equipment Type (based on category) */}
              {equipForm.category && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Equipment Type *</label>
                  <select 
                    className={`w-full border rounded-md px-2 py-1.5 text-base ${
                      !equipForm.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    value={equipForm.type}
                    onChange={(e) => setEquipForm(v => ({...v, type: e.target.value, power: '', specification: ''}))}
                  >
                    <option value="">Select type...</option>
                    {equipForm.category === 'lighting' && (
                      <>
                        <option value="LED">LED</option>
                        <option value="HPS">HPS (High Pressure Sodium)</option>
                        <option value="MH">MH (Metal Halide)</option>
                        <option value="CFL">CFL (Compact Fluorescent)</option>
                        <option value="T5">T5 Fluorescent</option>
                      </>
                    )}
                    {equipForm.category === 'ventilation' && (
                      <>
                        <option value="exhaust-fan">Exhaust Fan</option>
                        <option value="intake-fan">Intake Fan</option>
                        <option value="circulation-fan">Circulation Fan</option>
                        <option value="carbon-filter">Carbon Filter</option>
                      </>
                    )}
                    {equipForm.category === 'irrigation' && (
                      <>
                        <option value="drip-system">Drip System</option>
                        <option value="sprinkler">Sprinkler</option>
                        <option value="hydroponic">Hydroponic System</option>
                        <option value="pump">Water Pump</option>
                      </>
                    )}
                    {equipForm.category === 'climate-control' && (
                      <>
                        <option value="heater">Heater</option>
                        <option value="air-conditioner">Air Conditioner</option>
                        <option value="humidifier">Humidifier</option>
                        <option value="dehumidifier">Dehumidifier</option>
                      </>
                    )}
                    {equipForm.category === 'monitoring' && (
                      <>
                        <option value="temperature-sensor">Temperature Sensor</option>
                        <option value="humidity-sensor">Humidity Sensor</option>
                        <option value="ph-meter">pH Meter</option>
                        <option value="camera">Security Camera</option>
                      </>
                    )}
                    {equipForm.category === 'other' && (
                      <option value="custom">Custom Equipment</option>
                    )}
                  </select>
                </div>
              )}

              {/* Power/Size specification */}
              {equipForm.type && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {equipForm.category === 'lighting' ? 'Power (Watts) *' : 
                     equipForm.category === 'ventilation' ? 'CFM Rating *' :
                     equipForm.category === 'irrigation' ? 'Flow Rate *' :
                     'Power/Capacity *'}
                  </label>
                  <input 
                    className={`w-full border rounded-md px-2 py-1.5 text-base ${
                      !equipForm.power ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`} 
                    type="number"
                    min="1"
                    max="100000"
                    value={equipForm.power} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1 || value > 100000) return;
                      setEquipForm(v => ({...v, power: e.target.value}));
                    }} 
                    placeholder={
                      equipForm.category === 'lighting' ? 'e.g., 500, 1000' :
                      equipForm.category === 'ventilation' ? 'e.g., 400' :
                      equipForm.category === 'irrigation' ? 'e.g., 5' :
                      'e.g., 1500, 200, etc.'
                    }
                  />
                </div>
              )}

              {/* Specification details */}
              {equipForm.power && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Specification *</label>
                  <select 
                    className={`w-full border rounded-md px-2 py-1.5 text-base ${
                      !equipForm.specification ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    value={equipForm.specification}
                    onChange={(e) => setEquipForm(v => ({...v, specification: e.target.value}))}
                  >
                    <option value="">Select specification...</option>
                    {equipForm.category === 'lighting' && (
                      <>
                        <option value="Full Spectrum">Full Spectrum</option>
                        <option value="Red/Blue Spectrum">Red/Blue Spectrum</option>
                        <option value="Vegetative Spectrum">Vegetative Spectrum</option>
                        <option value="Flowering Spectrum">Flowering Spectrum</option>
                        <option value="UV Enhanced">UV Enhanced</option>
                      </>
                    )}
                    {equipForm.category === 'ventilation' && (
                      <>
                        <option value="Variable Speed">Variable Speed</option>
                        <option value="Fixed Speed">Fixed Speed</option>
                        <option value="Temperature Controlled">Temperature Controlled</option>
                        <option value="Humidity Controlled">Humidity Controlled</option>
                      </>
                    )}
                    {equipForm.category === 'irrigation' && (
                      <>
                        <option value="Timer Controlled">Timer Controlled</option>
                        <option value="Manual Control">Manual Control</option>
                        <option value="Sensor Controlled">Sensor Controlled</option>
                        <option value="Pressure Compensated">Pressure Compensated</option>
                      </>
                    )}
                    {equipForm.category === 'climate-control' && (
                      <>
                        <option value="Digital Thermostat">Digital Thermostat</option>
                        <option value="Analog Control">Analog Control</option>
                        <option value="Smart Control">Smart Control</option>
                        <option value="Manual Control">Manual Control</option>
                      </>
                    )}
                    {equipForm.category === 'monitoring' && (
                      <>
                        <option value="Wireless">Wireless</option>
                        <option value="Wired">Wired</option>
                        <option value="Data Logging">Data Logging</option>
                        <option value="Real-time Alerts">Real-time Alerts</option>
                      </>
                    )}
                    {equipForm.category === 'other' && (
                      <option value="Standard">Standard</option>
                    )}
                  </select>
                </div>
              )}

              {/* Location within structure */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Location in {selectedTop} *</label>
                <select 
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !equipForm.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  value={equipForm.location}
                  onChange={(e) => setEquipForm(v => ({...v, location: e.target.value}))}
                >
                  <option value="">Select location...</option>
                  <option value="General Room">General Room</option>
                  
                  {/* Show tents if available */}
                  {currentStructure?.tents?.map((tent, index) => (
                    <option key={`tent-${index}`} value={`Tent ${index + 1}`}>
                      Tent {index + 1} ({tent.widthFt}' × {tent.lengthFt}')
                    </option>
                  ))}
                  
                  {/* Show racks if available */}
                  {currentStructure?.racks?.map((rack, index) => (
                    <option key={`rack-${index}`} value={`Rack ${index + 1}`}>
                      Rack {index + 1} ({rack.widthCm}cm × {rack.lengthCm}cm, {rack.shelves} shelves)
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Equipment Name/ID *</label>
                <input 
                  className={`w-full border rounded-md px-2 py-1.5 text-base ${
                    !equipForm.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`} 
                  value={equipForm.name} 
                  onChange={(e) => setEquipForm(v => ({...v, name: e.target.value}))} 
                  placeholder="e.g., LED Panel A1, Exhaust Fan North, etc."
                />
              </div>

              {/* IoT Device Connection */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Connect IoT Device (optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIotScanning(true);
                        setIotDevices([]);
                        
                        // Simulate scanning for devices
                        setTimeout(() => {
                          const mockDevices = [
                            { id: 'esp32-001', name: 'ESP32 Temperature Sensor', type: 'sensor', signal: 85 },
                            { id: 'arduino-002', name: 'Arduino Light Controller', type: 'controller', signal: 72 },
                            { id: 'rpi-003', name: 'Raspberry Pi Camera', type: 'camera', signal: 91 },
                            { id: 'esp8266-004', name: 'ESP8266 Humidity Monitor', type: 'sensor', signal: 68 },
                          ];
                          setIotDevices(mockDevices);
                          setIotScanning(false);
                        }, 2000);
                      }}
                      disabled={iotScanning}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
                    >
                      {iotScanning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Scan for Devices
                        </>
                      )}
                    </button>
                    {equipForm.iotDevice && (
                      <span className="flex items-center px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                        ✓ Connected: {iotDevices.find(d => d.id === equipForm.iotDevice)?.name || equipForm.iotDevice}
                      </span>
                    )}
                  </div>

                  {/* Device list */}
                  {iotDevices.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                      <div className="text-xs text-gray-500 mb-1">Found {iotDevices.length} device(s):</div>
                      {iotDevices.map((device) => (
                        <div
                          key={device.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                            equipForm.iotDevice === device.id 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setEquipForm(v => ({...v, iotDevice: device.id}))}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{device.name}</div>
                            <div className="text-xs text-gray-500">ID: {device.id} • Type: {device.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500">Signal: {device.signal}%</div>
                            <div className={`w-2 h-2 rounded-full ${
                              device.signal > 80 ? 'bg-green-500' :
                              device.signal > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            {equipForm.iotDevice === device.id && (
                              <span className="text-green-600 text-xs">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button 
                className="px-3 py-1.5 text-sm text-gray-700" 
                onClick={() => setEquipModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!equipForm.name.trim() || !equipForm.category || !equipForm.type || !equipForm.power || !equipForm.specification || !equipForm.location}
                title={
                  !equipForm.name.trim() ? "Equipment name is required" :
                  !equipForm.category ? "Equipment category is required" :
                  !equipForm.type ? "Equipment type is required" :
                  !equipForm.power ? "Power specification is required" :
                  !equipForm.specification ? "Specification details are required" :
                  !equipForm.location ? "Location is required" :
                  "Add equipment"
                }
                onClick={async () => {
                  try {
                    // Create equipment in database
                    const equipmentData = {
                      type: equipForm.category,
                      subtype: equipForm.type,
                      details: {
                        'Name': equipForm.name.trim(),
                        'Power': equipForm.power,
                        'Specification': equipForm.specification,
                        'Description': equipForm.description || ''
                      },
                      location: `${selectedTop} → ${equipForm.location}`,
                      iotDevice: equipForm.iotDevice || undefined
                    };
                    
                    console.log('Creating equipment:', equipmentData);
                    
                    // Save to database
                    const newEquipment = await api.createEquipment(equipmentData);
                    
                    // Update equipment list immediately
                    setEquipmentList(prev => [...prev, newEquipment]);
                    
                    // Close modal and reset form
                    setEquipModalOpen(false);
                    setEquipForm({ name: '', category: '', type: '', power: '', specification: '', location: '', description: '', iotDevice: '' });
                    setIotDevices([]);
                    
                    console.log('Equipment created successfully');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

function TreeView({
  items,
  expandedTop,
  expandedSub,
  onToggleTop,
  onToggleSub,
  onSelectPlant,
}: {
  items: TopLocation[];
  expandedTop: Record<string, boolean>;
  expandedSub: Record<string, boolean>;
  onToggleTop: (k: string) => void;
  onToggleSub: (topK: string, subK: string) => void;
  onSelectPlant: (p: Plant) => void;
}) {
  const grouped: Record<'Indoor' | 'Outdoor', TopLocation[]> = { Indoor: [], Outdoor: [] };
  items.forEach((i) => {
    const cat = categoryTitle(i.type);
    if (cat === 'Indoor') grouped.Indoor.push(i);
    else if (cat === 'Outdoor') grouped.Outdoor.push(i);
  });
  const sections = [
    { title: 'Indoor', list: grouped.Indoor },
    { title: 'Outdoor', list: grouped.Outdoor },
  ].filter((s) => s.list.length > 0);

  return (
    <div className="text-sm">
      {sections.map((sec) => (
        <div key={sec.title} className="mb-3">
          <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">{sec.title}</div>
          <ul className="space-y-1">
            {sec.list.map((loc) => {
              const isOpen = !!expandedTop[loc.key];
              const subs = Object.values(loc.sublocations).sort((a, b) => a.key.localeCompare(b.key));
              const plantCount = subs.reduce((a, s) => a + s.plants.length, 0) + loc.plants.length;
              return (
                <li key={loc.key}>
                  <div className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50">
                    <button
                      className="shrink-0 p-1 rounded border border-gray-200 hover:bg-white"
                      onClick={() => onToggleTop(loc.key)}
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{loc.key}</div>
                        <div className="text-xs text-gray-500">{plantCount} plants</div>
                      </div>
                      <div className="text-[11px] text-gray-500">{subCategoryTitle(loc.type)}</div>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="ml-6 mt-1">
                      {loc.plants.length > 0 && (
                        <div className="mb-1">
                          <div className="text-[11px] text-gray-500 px-2">Unassigned</div>
                          <ul className="mt-1 space-y-1">
                            {loc.plants.map((p) => (
                              <li key={p.id}>
                                <button className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50" onClick={() => onSelectPlant(p)}>
                                  <Sprout className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                                  <span className="text-gray-800">{p.strain}</span>
                                  <span className="ml-auto text-[11px] text-gray-500">{p.id.slice(0, 6)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <ul className="space-y-1">
                        {subs.map((s) => {
                          const key = `${loc.key}::${s.key}`;
                          const open = !!expandedSub[key];
                          return (
                            <li key={s.key}>
                              <div className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50">
                                <button
                                  className="shrink-0 p-1 rounded border border-gray-200 hover:bg-white"
                                  onClick={() => onToggleSub(loc.key, s.key)}
                                  aria-label={open ? 'Collapse area' : 'Expand area'}
                                >
                                  {open ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="text-gray-800">{s.key}</div>
                                    <div className="text-[11px] text-gray-500">{s.plants.length} plants</div>
                                  </div>
                                  <div className="text-[11px] text-gray-500 capitalize">{s.type}</div>
                                </div>
                              </div>
                              {open && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {s.plants.map((p) => (
                                    <li key={p.id}>
                                      <button className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50" onClick={() => onSelectPlant(p)}>
                                        <Sprout className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                                        <span className="text-gray-800">{p.strain}</span>
                                        <span className="ml-auto text-[11px] text-gray-500">{p.id.slice(0, 6)}</span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PlantGrid({ plants, onOpen }: { plants: Plant[]; onOpen?: (p: Plant) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {plants.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <div className="flex items-start justify-between">
            <div className="font-medium text-gray-900">{p.strain}</div>
            <Sprout className="h-4 w-4 text-green-600" aria-hidden />
          </div>
          <div className="text-xs text-gray-500 mt-1">Planted {new Date(p.plantedAt).toLocaleDateString()}</div>
          <div className="mt-2 flex items-center justify-between">
            <code className="text-[11px] text-gray-600">{p.id.slice(0, 8)}</code>
            {onOpen ? (
              <button className="text-xs text-primary hover:underline" onClick={() => onOpen(p)}>View</button>
            ) : (
              <span className="text-xs text-gray-400">Details</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlantDetailsView({ plant, onBack }: { plant: Plant; onBack: () => void }) {
  const ageDays = Math.floor((Date.now() - new Date(plant.plantedAt).getTime()) / 86400000);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Back to plants
        </button>
      </div>
      <Card>
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-md bg-emerald-50 p-2">
            <Sprout className="h-6 w-6 text-emerald-600" aria-hidden />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{plant.strain}</h2>
            <div className="text-sm text-gray-600">Plant ID: <code className="text-xs">{plant.id}</code></div>
            <div className="text-sm text-gray-600">Location: {prettyLocationString(plant.location)}</div>
            <div className="text-sm text-gray-600">Planted: {new Date(plant.plantedAt).toLocaleString()} ({ageDays} days ago)</div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4 text-gray-400" aria-hidden />
          Lifecycle and event history will appear here in future iterations.
        </div>
      </Card>
    </div>
  );
}
