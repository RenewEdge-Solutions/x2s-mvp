import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
import { Sprout, Map as MapIcon, Layers, ChevronRight, ChevronLeft, Info, ChevronDown, Plus, MapPin, Trash } from 'lucide-react';

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

export default function Plants() {
  const { activeModule } = useModule();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<string | null>(null); // geo id
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null); // facility id
  type Geo = { id: string; name: string; address?: string; lat?: number; lng?: number };
  type Facility = { id: string; name: string; type: 'farm' | 'building'; geo: { id: string } };
  const [geoList, setGeoList] = useState<Geo[]>([]);
  const [facilityList, setFacilityList] = useState<Facility[]>([]);
  // Removed Add Location wizard and draft preview
  const [expandedTop, setExpandedTop] = useState<Record<string, boolean>>({});
  const [expandedSub, setExpandedSub] = useState<Record<string, boolean>>({});
  // Removed Unassigned from Areas UI

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

  const locations = useMemo(() => buildLocations(plants.filter((p) => !p.harvested)), [plants]);
  // Derive geolocations from the first segment before first comma in facility name if available, else use full facility name.
  // Geolocations come from local storage only (empty state supported)
  const geos = useMemo(() => geoList.sort((a,b)=> a.name.localeCompare(b.name)), [geoList]);
  const facilitiesForGeo = useMemo(() => {
    if (!selectedGeo) return [] as Facility[];
    return facilityList.filter(f => f.geo?.id === selectedGeo).sort((a,b)=> a.name.localeCompare(b.name));
  }, [facilityList, selectedGeo]);
  

  // Modals state
  const [geoModalOpen, setGeoModalOpen] = useState(false);
  const [geoForm, setGeoForm] = useState<{ name: string; address: string; lat?: number; lng?: number }>({ name: '', address: '' });
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [facilityForm, setFacilityForm] = useState<{ name: string; type: 'farm' | 'building' }>({ name: '', type: 'farm' });
  // Structures (per facility)
  type Structure = { facility: string; type: 'room' | 'greenhouse'; name: string; size?: number };
  const loadStructures = (): Structure[] => {
    try { return JSON.parse(localStorage.getItem('mvp.structures') || '[]'); } catch { return []; }
  };
  const [structureList, setStructureList] = useState<Structure[]>(loadStructures);
  const persistStructures = (arr: Structure[]) => { setStructureList(arr); localStorage.setItem('mvp.structures', JSON.stringify(arr)); };
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [structureForm, setStructureForm] = useState<{ name: string; type: 'room' | 'greenhouse'; size: string }>({ name: '', type: 'room', size: '' });
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
          <MapIcon className="h-6 w-6" aria-hidden /> Production
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            title="Reset local data"
            aria-label="Reset local data"
            onClick={() => {
              // Clear local-only MVP data
              localStorage.removeItem('mvp.geos');
              localStorage.removeItem('mvp.facilities');
              localStorage.removeItem('mvp.structures');
              setGeoList([]);
              setFacilityList([]);
              setStructureList([]);
              setSelectedGeo(null);
              setSelectedFacility(null);
              setSelectedTop(null);
              setSelectedSub(null);
              setSelectedPlant(null);
            }}
          >
            <Trash className="h-4 w-4" aria-hidden />
          </button>
        </div>
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
                  <option key={f.name} value={f.name}>{f.name} · {f.type}</option>
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

      <div className="grid gap-4 items-start grid-cols-1 md:[grid-template-columns:280px_minmax(0,1fr)] lg:[grid-template-columns:280px_280px_minmax(0,1fr)] xl:[grid-template-columns:280px_280px_minmax(0,1fr)]">
        {/* Pane 1: Geolocations */}
        {!selectedPlant && (
        <Card className="hidden xl:block">
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
                        onClick={() => { setSelectedGeo(g.id); setSelectedFacility(null); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }}
                      >
                        <div className="min-w-0">
                          <div className="text-base text-gray-900 truncate">{g.name}</div>
                          <div className="text-sm text-gray-500">{facilityList.filter(f=>f.geo?.id===g.id).length} facilities</div>
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
        {/* Pane 2: Facilities for selected geolocation */}
        {selectedGeo && (
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
                      onClick={() => { setSelectedFacility(f.id); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }}
                    >
                      <div className="min-w-0">
                        <div className="text-base text-gray-900 truncate">{f.name} <span className="text-sm text-gray-500">· {f.type}</span></div>
                        <div className="text-sm text-gray-500">{selectedFacility === f.id ? structureList.length : 0} structures</div>
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

        {/* Pane 3: Structures (Rooms/Greenhouses) within selected facility */}
        {selectedFacility && (
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
          setStructureForm({ name: '', type: defType, size: '' });
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
                      const plantCount = subs.reduce((a, s) => a + s.plants.length, 0) + loc.plants.length;
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
                          parts.push(plural(plantCount, 'plant'));
                          return parts.join(' . ');
                        }
                        if (loc.type === 'greenhouse') {
                          const parts: string[] = [];
                          if (beds > 0) parts.push(plural(beds, 'bed'));
                          parts.push(plural(plantCount, 'plant'));
                          return parts.join(' . ');
                        }
                        return `${subs.length} areas . ${plural(plantCount, 'plant')}`;
                      })();
                      return (
                        <li key={loc.key}>
                          <button
                            className={`w-full text-left px-3 py-2 flex items-center justify-between ${active ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                            onClick={() => { setSelectedTop(loc.key); setSelectedSub(null); setSelectedPlant(null); }}
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

        {/* Pane 4: Areas/Plants within selected structure */}
        {selectedTop && (
      <Card>
            <div className="w-full min-w-0">
              <h2 className="text-base font-medium text-gray-900 mb-2">Plants</h2>
              {(() => {
                const loc = locations[selectedTop!];
                const plantsList = !selectedSub ? [] : (loc?.sublocations?.[selectedSub!]?.plants || []);
                return (selectedSub && plantsList.length > 0) ? (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    {plantsList.map((p) => (
                      <li key={p.id}>
                        <button
                          className={`w-full text-left px-3 py-2 flex items-center gap-2 ${selectedPlant?.id === p.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedPlant(p)}
                        >
                          <Sprout className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              <span className="text-base text-gray-900 truncate min-w-0">{p.strain}</span>
              <span className="ml-auto text-sm text-gray-500 shrink-0">{p.id.slice(0,6)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
          <div className="text-base text-gray-500">{!selectedSub ? 'Choose an area.' : 'No plants here.'}</div>
                );
              })()}
            </div>
          </Card>
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
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={geoForm.name} onChange={(e)=> setGeoForm(v=>({...v, name: e.target.value}))} placeholder="e.g., Munich HQ"/>
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
                  const created = await api.createGeo({ name: geoForm.name.trim(), address: geoForm.address.trim() });
                  const gs = await api.getGeos();
                  setGeoList(gs);
                  setSelectedGeo(created.id);
                  setGeoModalOpen(false);
                  setGeoForm({ name: '', address: '' });
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
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={facilityForm.type} onChange={(e)=> setFacilityForm(v=>({...v, type: e.target.value as any}))}>
                  <option value="farm">Farm</option>
                  <option value="building">Building</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={facilityForm.name} onChange={(e)=> setFacilityForm(v=>({...v, name: e.target.value}))} placeholder="e.g., North Farm or Building A"/>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700" onClick={()=> setFacilityModalOpen(false)}>Cancel</button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!selectedGeo || !facilityForm.name.trim()}
                onClick={async ()=>{
                  if (!selectedGeo) return;
                  const created = await api.createFacility({ geoId: selectedGeo, name: facilityForm.name.trim(), type: facilityForm.type });
                  const fs = await api.getFacilities(selectedGeo);
                  setFacilityList(fs);
                  setSelectedFacility(created.id);
                  setFacilityModalOpen(false);
                  setFacilityForm({ name: '', type: 'farm' });
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
                const f = facilityList.find((x)=> x.name === selectedFacility);
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
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base" value={structureForm.name} onChange={(e)=> setStructureForm((v)=> ({ ...v, name: e.target.value }))} placeholder="e.g., Room 1 or Greenhouse 2"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Size (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-base"
                  value={structureForm.size}
                  onChange={(e)=> setStructureForm((v)=> ({ ...v, size: e.target.value }))}
                  placeholder="e.g., 120"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-700" onClick={()=> setStructureModalOpen(false)}>Cancel</button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50"
                disabled={!structureForm.name.trim() || structureForm.size.trim() === ''}
                onClick={async ()=>{
                  if (!selectedFacility) return;
                  const name = structureForm.name.trim();
                  const type = structureForm.type;
                  const sizeNum = Number(structureForm.size);
                  await api.createStructure({ facilityId: selectedFacility, name, type, size: isNaN(sizeNum) ? 0 : sizeNum });
                  const list = await api.getStructures(selectedFacility);
                  setStructureList(list.map((s: any) => ({ id: s.id, facility: s.facility?.id, name: s.name, type: s.type, size: s.size })));
                  setStructureModalOpen(false);
                  setStructureForm({ name: '', type: 'room', size: '' });
                }}
              >
                Confirm
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
