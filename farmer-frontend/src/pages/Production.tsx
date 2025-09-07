import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
import {
  Plus,
  Leaf,
  Scissors,
  Beaker,
  Package,
  Truck,
  Wind,
  Timer,
  Filter,
  Search as SearchIcon,
  Sprout,
  BarChart3,
  MapPin,
  Workflow,
} from 'lucide-react';

export default function Production() {
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newPlant, setNewPlant] = useState({ strain: '', location: '' });

  // UI state (filters/search)
  const [q, setQ] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'vegetative' | 'flowering' | 'harvest' | 'drying' | 'other'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Quick actions drawers
  const [showGermination, setShowGermination] = useState(false);
  const [showTransplant, setShowTransplant] = useState(false);
  const [showFlipToFlower, setShowFlipToFlower] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [showLabSubmission, setShowLabSubmission] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showStartDrying, setShowStartDrying] = useState(false);
  const [showEndDrying, setShowEndDrying] = useState(false);
  const [showCloning, setShowCloning] = useState(false);
  const [showRelocate, setShowRelocate] = useState(false);

  // Quick action forms state (selective, to support derived summaries)
  const [cloneForm, setCloneForm] = useState({
    motherId: '',
    strain: '',
    cuttings: 48,
    hormone: 'Gel (0.3%)',
    medium: 'Rockwool',
    tray: '',
    date: new Date().toISOString().slice(0,10),
    assignPrefix: 'CLN',
    assignStart: 1001,
    assignCount: 48,
    staff: '',
    witness: '',
  });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [pl, hv, occ, al] = await Promise.all([
      api.getPlants(),
      api.getHarvests(),
      api.getAllOccupancy(),
      api.getEmptyCapacityAlerts(),
    ]);
    setPlants(pl);
    setHarvests(hv);
    setOccupancy(Array.isArray(occ) ? occ : []);
    setAlerts(al || { emptyStructures: [], lowUtilizationStructures: [], overCapacityStructures: [] });
  }

  async function createPlant() {
    if (!newPlant.strain || !newPlant.location) return;
    setCreating(true);
    try {
      await api.createPlant({ strain: newPlant.strain, location: newPlant.location });
      setNewPlant({ strain: '', location: '' });
      await refresh();
    } finally {
      setCreating(false);
    }
  }

  // Normalize stages for consistent UI
  function normStage(s: string): 'vegetative' | 'flowering' | 'harvest' | 'drying' | 'other' {
    const v = (s || '').toLowerCase();
    if (v.startsWith('veg')) return 'vegetative';
    if (v.startsWith('flow')) return 'flowering';
    if (v.includes('harvest')) return 'harvest';
    if (v.includes('dry')) return 'drying';
    return 'other';
  }

  const stageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plants) {
      const ns = normStage(p.stage);
      counts[ns] = (counts[ns] || 0) + 1;
    }
    return counts;
  }, [plants]);

  // Derived lists for realistic selects
  const plantIds = useMemo(() => plants.map((p) => p.id), [plants]);
  const strains = useMemo(() => Array.from(new Set(plants.map((p) => p.strain).filter(Boolean))).sort(), [plants]);
  const locations = useMemo(() => Array.from(new Set(plants.map((p) => p.location).filter(Boolean))).sort(), [plants]);
  const flowerRooms = useMemo(() => locations.filter((l) => /flower/i.test(l)).length ? locations.filter((l) => /flower/i.test(l)) : locations, [locations]);
  const dryRooms = useMemo(() => locations.filter((l) => /dry|cure/i.test(l)).length ? locations.filter((l) => /dry|cure/i.test(l)) : locations, [locations]);
  const batchIds = useMemo(() => Array.from(new Set(harvests.map((h) => h.id))).sort(), [harvests]);
  const facilities = useMemo(() => Array.from(new Set(locations.map((l) => (l?.split('-')[0] || '').trim()).filter(Boolean))).sort(), [locations]);
  const labs = ['St. Lucia State Lab', 'Carib Labs Ltd.', 'Third-Party QA'];
  const licensees = ['Retailer ABC (LIC-12345)', 'Distributor XYZ (LIC-90210)', 'Lab Partner (LIC-55555)'];
  const drivers = ['J. Doe', 'S. Pierre', 'K. Thomas'];
  const plates = ['SLU-1234', 'SLU-9876', 'SLU-4321'];
  const staff = ['A. Joseph', 'M. Brown', 'L. Singh'];

  const selectedMother = useMemo(() => plants.find(p => p.id === cloneForm.motherId), [plants, cloneForm.motherId]);

  // Derived filtered plants
  const filteredPlants = useMemo(() => {
    const term = q.trim().toLowerCase();
    return plants.filter((p) => {
      const matchesQ = !term || `${p.id} ${p.strain} ${p.location} ${p.stage}`.toLowerCase().includes(term);
      const matchesStage = stageFilter === 'all' || normStage(p.stage) === stageFilter || (stageFilter === 'harvest' && p.harvested);
      const matchesLoc = locationFilter === 'all' || p.location === locationFilter;
      return matchesQ && matchesStage && matchesLoc;
    });
  }, [plants, q, stageFilter, locationFilter]);

  function daysSince(iso?: string) {
    if (!iso) return null;
    const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
    return d;
  }

  // Sites & structures (occupancy and capacity alerts)
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>({ emptyStructures: [], lowUtilizationStructures: [], overCapacityStructures: [] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2"><Workflow className="h-5 w-5 text-emerald-600" aria-hidden /> Production</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Plants</div>
            <Sprout className="h-4 w-4 text-emerald-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{plants.length.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">
            {`Veg: ${stageStats['vegetative'] || 0} • Flower: ${stageStats['flowering'] || 0}`}
            {stageStats['drying'] ? ` • Drying: ${stageStats['drying']}` : ''}
            {stageStats['harvest'] ? ` • Harvest: ${stageStats['harvest']}` : ''}
            {stageStats['other'] ? ` • Other: ${stageStats['other']}` : ''}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Harvests (total)</div>
            <Scissors className="h-4 w-4 text-emerald-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{harvests.length.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">Recent entries listed below</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Active batches (est.)</div>
            <BarChart3 className="h-4 w-4 text-emerald-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{Math.max(1, Math.round(plants.length/40))}</div>
          <div className="mt-1 text-xs text-gray-500">Derived from plant count</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Plants">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="hidden sm:inline">{filteredPlants.length}</span>
              <span className="hidden sm:inline">records</span>
              <span className="sm:hidden">{filteredPlants.length} records</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <SearchIcon className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" aria-hidden />
                <input
                  placeholder="Search plants..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-7 rounded-md border-gray-300 px-2 py-1.5 text-sm w-48"
                />
              </div>
              <div className="inline-flex items-center gap-2">
                <div className="inline-flex items-center gap-1">
                  <Filter className="h-4 w-4 text-gray-400" aria-hidden />
                  <select
                    className="rounded-md border-gray-300 px-2 py-1.5 text-sm"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as any)}
                  >
                    <option value="all">All stages</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="harvest">Harvest</option>
                    <option value="drying">Drying</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <select
                  className="rounded-md border-gray-300 px-2 py-1.5 text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All locations</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="hidden sm:inline-block w-px self-stretch bg-gray-200" />
              <div className="inline-flex items-center gap-2">
                <input
                  placeholder="Strain"
                  value={newPlant.strain}
                  onChange={(e) => setNewPlant({ ...newPlant, strain: e.target.value })}
                  className="rounded-md border-gray-300 px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Location"
                  value={newPlant.location}
                  onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                  className="rounded-md border-gray-300 px-2 py-1.5 text-sm"
                />
                <button
                  onClick={createPlant}
                  disabled={creating || !newPlant.strain || !newPlant.location}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Add plant
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-auto max-h-[26rem] rounded-lg border border-gray-100">
            <table className="min-w-full w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Plant</th>
                  <th className="py-2 px-3 font-semibold">Strain</th>
                  <th className="py-2 px-3 font-semibold">Stage</th>
                  <th className="py-2 px-3 font-semibold">Location</th>
                  <th className="py-2 px-3 font-semibold">Planted</th>
                  <th className="py-2 px-3 font-semibold">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlants.map((p) => (
                  <tr key={p.id} className="text-gray-800 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono">{p.id}</td>
                    <td className="py-2 px-3">{p.strain}</td>
                    <td className="py-2 px-3"><StageBadge stage={p.stage} /></td>
                    <td className="py-2 px-3">{p.location}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">{p.plantedAt ? new Date(p.plantedAt).toLocaleDateString() : '—'}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">{daysSince(p.plantedAt) ?? '—'}{daysSince(p.plantedAt) != null ? 'd' : ''}</td>
                  </tr>
                ))}
                {filteredPlants.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-500">No matching plants.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quick actions">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Action label="Germination" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowGermination(true)} />
            <Action label="Cloning" icon={<Sprout className="h-4 w-4" />} onClick={() => setShowCloning(true)} />
            <Action label="Transplant" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowTransplant(true)} />
            <Action label="Flip to flower" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowFlipToFlower(true)} />
            <Action label="Harvest" icon={<Scissors className="h-4 w-4" />} onClick={() => setShowHarvest(true)} />
            <Action label="Start drying" icon={<Wind className="h-4 w-4" />} onClick={() => setShowStartDrying(true)} />
            <Action label="End drying" icon={<Timer className="h-4 w-4" />} onClick={() => setShowEndDrying(true)} />
            <Action label="Lab submission" icon={<Beaker className="h-4 w-4" />} onClick={() => setShowLabSubmission(true)} />
            <Action label="Packaging" icon={<Package className="h-4 w-4" />} onClick={() => setShowPackaging(true)} />
            <Action label="Transfer" icon={<Truck className="h-4 w-4" />} onClick={() => setShowTransfer(true)} />
            <Action label="Relocate" icon={<MapPin className="h-4 w-4" />} onClick={() => setShowRelocate(true)} />
          </div>
        </Card>
      </div>

      {/* Sites & Structures overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Sites & structures" subtitle="Occupancy and utilization overview" to="/facilities">
          <div className="space-y-3">
            {occupancy.length === 0 && (
              <div className="text-sm text-gray-500">No occupancy data available.</div>
            )}
            {occupancy.map((o) => {
              const pct = o.capacity > 0 ? Math.round((o.occupied / o.capacity) * 100) : 0;
              const barCls = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={o.structureId} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{o.structure}</div>
                      <div className="text-xs text-gray-500 truncate">{o.facility}</div>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{o.occupied}/{o.capacity}</div>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                    <div className={`h-full ${barCls}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">{pct}% utilized</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Capacity alerts" subtitle="Key utilization signals">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="text-gray-700">Empty structures</div>
              <div className="font-semibold text-gray-900">{alerts.emptyStructures?.length ?? 0}</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="text-gray-700">Low utilization</div>
              <div className="font-semibold text-gray-900">{alerts.lowUtilizationStructures?.length ?? 0}</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="text-gray-700">Over capacity</div>
              <div className="font-semibold text-gray-900">{alerts.overCapacityStructures?.length ?? 0}</div>
            </div>
            <div className="border-t border-gray-100 pt-2">
              {alerts.lowUtilizationStructures?.slice(0, 2).map((s: any) => (
                <div key={`low-${s.structureId}`} className="mb-2 last:mb-0">
                  <div className="text-gray-800 text-sm font-medium">{s.structureName} <span className="text-xs text-gray-500">@ {s.facilityName}</span></div>
                  <div className="text-xs text-gray-500">Occupancy: {(s.occupancyRate * 100).toFixed(0)}%</div>
                </div>
              ))}
              {alerts.emptyStructures?.slice(0, 2).map((s: any) => (
                <div key={`empty-${s.structureId}`} className="mb-2 last:mb-0">
                  <div className="text-gray-800 text-sm font-medium">{s.structureName} <span className="text-xs text-gray-500">@ {s.facilityName}</span></div>
                  <div className="text-xs text-gray-500">Empty</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card title="Recent harvests">
          <div className="overflow-auto max-h-[20rem] rounded-lg border border-gray-100">
            <table className="min-w-full w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Harvest</th>
                  <th className="py-2 px-3 font-semibold">Plant</th>
                  <th className="py-2 px-3 font-semibold">Yield (g)</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {harvests.map((h) => (
                  <tr key={h.id} className="text-gray-800 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono">{h.id}</td>
                    <td className="py-2 px-3 font-mono">{h.plantId}</td>
                    <td className="py-2 px-3">{h.yieldGrams}</td>
                    <td className="py-2 px-3"><HarvestStatusBadge status={h.status} /></td>
                    <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">{h.harvestedAt ? new Date(h.harvestedAt).toLocaleDateString() : new Date(h.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {harvests.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">No harvests yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>


      {/* Quick actions modals (mock, realistic forms) */}
      {showGermination && (
        <Drawer title="Start Germination" onClose={() => setShowGermination(false)} onSubmit={() => setShowGermination(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2">
              <span className="block text-gray-700 mb-1">Seed lot</span>
              <select className="w-full rounded-md border-gray-300">
                {[0,1,2].map((i)=>{
                  const d = new Date(Date.now()-i*86400000).toISOString().slice(0,10);
                  const compact = d.replace(/-/g, '');
                  return <option key={i} value={`LOT-${compact}`}>{`LOT-${compact}`}</option>;
                })}
              </select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Supplier</span><input className="w-full rounded-md border-gray-300" placeholder="SeedCo Ltd." defaultValue="SeedCo Ltd." /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Certificate / COA</span><input className="w-full rounded-md border-gray-300" placeholder="COA-2025-0902-01" defaultValue={`COA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`} /></label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Strain</span>
              <select className="w-full rounded-md border-gray-300">{strains.length?strains.map(s=>(<option key={s}>{s}</option>)):<option>Unknown</option>}</select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Date</span>
              <input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} />
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Tray/Location</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={l}>{l}</option>)):<option>Propagation Room - Tray 1</option>}</select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Seeds count</span>
              <input type="number" className="w-full rounded-md border-gray-300" placeholder="96" defaultValue={96} />
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Witness</span>
              <select className="w-full rounded-md border-gray-300"><option>—</option>{staff.map(s=>(<option key={`wit-${s}`}>{s}</option>))}</select>
            </label>
            <fieldset className="col-span-2 border-t border-gray-100 pt-3">
              <legend className="text-sm text-gray-700 mb-1">Assign plant IDs</legend>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm"><span className="block text-gray-700 mb-1">Prefix</span><input className="w-full rounded-md border-gray-300" defaultValue="SEED" /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Start #</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={1001} /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Count</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={96} /></label>
              </div>
            </fieldset>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={3} placeholder="Soak time, medium, temp, etc." /></label>
          </div>
        </Drawer>
      )}

      {showTransplant && (
        <Drawer title="Transplant Plants" onClose={() => setShowTransplant(false)} onSubmit={() => setShowTransplant(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">From (tray/bed)</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={`from-${l}`}>{l}</option>)):<option>Propagation Tray 1</option>}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">To (room/bed)</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={`to-${l}`}>{l}</option>)):<option>Veg Room 1 - Bed A</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Plants count</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="96" defaultValue={96} /></label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={3} placeholder="Media, spacing, stress notes..." /></label>
          </div>
        </Drawer>
      )}

      {showFlipToFlower && (
        <Drawer title="Flip to Flower" onClose={() => setShowFlipToFlower(false)} onSubmit={() => setShowFlipToFlower(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Room</span>
              <select className="w-full rounded-md border-gray-300">{flowerRooms.length?flowerRooms.map(r=>(<option key={r}>{r}</option>)):<option>Flower Room 1</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Flip date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Light schedule</span>
              <select className="w-full rounded-md border-gray-300"><option>12/12</option><option>18/6</option><option>20/4</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">SOP version</span><input className="w-full rounded-md border-gray-300" placeholder="SOP-FLOWER-1.2" defaultValue="SOP-FLOWER-1.2" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-flip-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Target harvest date</span><input type="date" className="w-full rounded-md border-gray-300" /></label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Any IPM events, defoliation plan, etc." /></label>
          </div>
        </Drawer>
      )}

      {showHarvest && (
        <Drawer title="Harvest Plants" onClose={() => setShowHarvest(false)} onSubmit={() => setShowHarvest(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Plant/Batch ID</span>
              <select className="w-full rounded-md border-gray-300">
                <optgroup label="Plants">
                  {plantIds.map(id => (<option key={`p-${id}`} value={id}>{id}</option>))}
                </optgroup>
                {batchIds.length>0 && (
                  <optgroup label="Batches">
                    {batchIds.map(id => (<option key={`b-${id}`} value={id}>{id}</option>))}
                  </optgroup>
                )}
              </select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Harvest room</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={`harv-${l}`}>{l}</option>)):<option>Harvest Room 1</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Harvest date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Wet weight (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="12450" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Method</span>
              <select className="w-full rounded-md border-gray-300"><option>Whole plant</option><option>Section</option><option>Selective</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Plants count</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 24" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Waste (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 800" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-h-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={3} placeholder="Crew, trim strategy, etc." /></label>
          </div>
        </Drawer>
      )}

      {showLabSubmission && (
        <Drawer title="Submit for Lab Testing" onClose={() => setShowLabSubmission(false)} onSubmit={() => setShowLabSubmission(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Batch ID</span>
              <select className="w-full rounded-md border-gray-300">{batchIds.length?batchIds.map(id=>(<option key={id} className="font-mono">{id}</option>)):<option>No batches</option>}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Lab</span>
              <select className="w-full rounded-md border-gray-300">{labs.map(l=>(<option key={l}>{l}</option>))}</select>
            </label>
            <fieldset className="col-span-2">
              <legend className="text-sm text-gray-700 mb-1">Tests requested</legend>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> Potency</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> Microbial</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> Heavy metals</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> Pesticides</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="rounded" /> Residual solvents</label>
              </div>
            </fieldset>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Sample ID</span><input className="w-full rounded-md border-gray-300" placeholder="SPL-0925-01" defaultValue={`SPL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Sample weight (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="10" defaultValue={10} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Chain-of-custody ID</span><input className="w-full rounded-md border-gray-300" placeholder="COC-9723" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Drop-off date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm inline-flex items-center gap-2 col-span-2"><input type="checkbox" className="rounded" defaultChecked /> Sealed container</label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Submitting staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-lab-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Sample size, chain-of-custody notes." /></label>
          </div>
        </Drawer>
      )}

      {showStartDrying && (
        <Drawer title="Start Drying" onClose={() => setShowStartDrying(false)} onSubmit={() => setShowStartDrying(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Batch ID</span>
              <select className="w-full rounded-md border-gray-300">{batchIds.length?batchIds.map(id=>(<option key={id} className="font-mono">{id}</option>)):<option>No batches</option>}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Dry room</span>
              <select className="w-full rounded-md border-gray-300">{dryRooms.length?dryRooms.map(r=>(<option key={r}>{r}</option>)):<option>Dry Room 1</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Start</span><input type="datetime-local" className="w-full rounded-md border-gray-300" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Target duration (days)</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={7} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Temperature (°C)</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={20} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Humidity (%)</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={55} /></label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Airflow</span>
              <select className="w-full rounded-md border-gray-300"><option>Low</option><option>Medium</option><option>High</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Rack/Row</span><input className="w-full rounded-md border-gray-300" placeholder="Rack B / Row 3" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-dry-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Hanging method, spacing, monitoring schedule." /></label>
          </div>
        </Drawer>
      )}

      {showEndDrying && (
        <Drawer title="End Drying" onClose={() => setShowEndDrying(false)} onSubmit={() => setShowEndDrying(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Batch ID</span>
              <select className="w-full rounded-md border-gray-300">{batchIds.length?batchIds.map(id=>(<option key={id} className="font-mono">{id}</option>)):<option>No batches</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">End</span><input type="datetime-local" className="w-full rounded-md border-gray-300" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Dry weight (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 3450" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Waste (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 120" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Moisture (%)</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={11} /></label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Next step</span>
              <select className="w-full rounded-md border-gray-300"><option>Cure</option><option>Trim</option><option>Package</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">QA check</span>
              <select className="w-full rounded-md border-gray-300"><option>Pass</option><option>Fail</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-enddry-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Any QC, stem snap test, aroma, etc." /></label>
          </div>
        </Drawer>
      )}

      {showCloning && (
        <Drawer title="Cloning (Cuttings)" onClose={() => setShowCloning(false)} onSubmit={() => setShowCloning(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2">
              <span className="block text-gray-700 mb-1">Mother plant</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.motherId} onChange={(e)=>setCloneForm({...cloneForm, motherId: e.target.value})}>
                <option value="">— Select —</option>
                {plantIds.map((id) => (
                  <option key={`donor-${id}`} value={id} className="font-mono">{id}</option>
                ))}
              </select>
            </label>
            {selectedMother && (
              <div className="col-span-2 rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="text-xs text-gray-600">Mother details</div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                  <div><div className="text-gray-500 text-xs">Strain</div><div className="text-gray-800">{selectedMother.strain}</div></div>
                  <div><div className="text-gray-500 text-xs">Location</div><div className="text-gray-800">{selectedMother.location}</div></div>
                  <div><div className="text-gray-500 text-xs">Age</div><div className="text-gray-800">{(selectedMother.plantedAt? Math.max(0, Math.floor((Date.now() - new Date(selectedMother.plantedAt).getTime())/86400000)) : '—')}d</div></div>
                </div>
              </div>
            )}
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Strain</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.strain || (selectedMother?.strain || '')} onChange={(e)=>setCloneForm({...cloneForm, strain: e.target.value })}>{strains.length?strains.map(s=>(<option key={`strain-${s}`}>{s}</option>)):<option>Unknown</option>}</select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Cuttings</span>
              <input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 48" value={cloneForm.cuttings} onChange={(e)=>setCloneForm({...cloneForm, cuttings: Number(e.target.value||0)})} />
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Rooting hormone</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.hormone} onChange={(e)=>setCloneForm({...cloneForm, hormone: e.target.value})}><option>Gel (0.3%)</option><option>Gel (0.8%)</option><option>Powder</option><option>None</option></select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Medium</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.medium} onChange={(e)=>setCloneForm({...cloneForm, medium: e.target.value})}><option>Rockwool</option><option>Peat plug</option><option>Aero cloner</option></select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Tray/Location</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.tray} onChange={(e)=>setCloneForm({...cloneForm, tray: e.target.value})}>{locations.length?locations.map(l=>(<option key={`clone-loc-${l}`}>{l}</option>)):<option>Propagation Room - Tray 1</option>}</select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Date</span>
              <input type="date" className="w-full rounded-md border-gray-300" value={cloneForm.date} onChange={(e)=>setCloneForm({...cloneForm, date: e.target.value})} />
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Responsible staff</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.staff} onChange={(e)=>setCloneForm({...cloneForm, staff: e.target.value})}><option>—</option>{staff.map(s=>(<option key={`stf-clone-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Witness</span>
              <select className="w-full rounded-md border-gray-300" value={cloneForm.witness} onChange={(e)=>setCloneForm({...cloneForm, witness: e.target.value})}><option>—</option>{staff.map(s=>(<option key={`wit-clone-${s}`}>{s}</option>))}</select>
            </label>
            <fieldset className="col-span-2 border-t border-gray-100 pt-3">
              <legend className="text-sm text-gray-700 mb-1">Assign clone IDs</legend>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm"><span className="block text-gray-700 mb-1">Prefix</span><input className="w-full rounded-md border-gray-300" value={cloneForm.assignPrefix} onChange={(e)=>setCloneForm({...cloneForm, assignPrefix: e.target.value})} /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Start #</span><input type="number" className="w-full rounded-md border-gray-300" value={cloneForm.assignStart} onChange={(e)=>setCloneForm({...cloneForm, assignStart: Number(e.target.value||0)})} /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Count</span><input type="number" className="w-full rounded-md border-gray-300" value={cloneForm.assignCount} onChange={(e)=>setCloneForm({...cloneForm, assignCount: Number(e.target.value||0)})} /></label>
              </div>
            </fieldset>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={3} placeholder="Humidity dome, misting schedule, etc." /></label>
          </div>
        </Drawer>
      )}

      {showRelocate && (
        <Drawer title="Relocate Plants" onClose={() => setShowRelocate(false)} onSubmit={() => setShowRelocate(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Plant ID</span>
              <select className="w-full rounded-md border-gray-300">{plantIds.map(id => (<option key={`mv-${id}`} value={id}>{id}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">From</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={`from-${l}`}>{l}</option>)):<option>Veg Room 1 - Tray A</option>}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">To</span>
              <select className="w-full rounded-md border-gray-300">{locations.length?locations.map(l=>(<option key={`to-${l}`}>{l}</option>)):<option>Veg Room 2 - Bed B</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Reason</span><input className="w-full rounded-md border-gray-300" placeholder="Trellis/bench move, IPM, etc." /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Authorized by</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-rel-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Trellis move, spacing, stress check." /></label>
          </div>
        </Drawer>
      )}

      {showPackaging && (
        <Drawer title="Package Product" onClose={() => setShowPackaging(false)} onSubmit={() => setShowPackaging(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Batch ID</span>
              <select className="w-full rounded-md border-gray-300">{batchIds.length?batchIds.map(id=>(<option key={id} className="font-mono">{id}</option>)):<option>No batches</option>}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Package type</span>
              <select className="w-full rounded-md border-gray-300"><option>Jar</option><option>Bag</option><option>Pre-roll</option><option>Bulk</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Units</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="100" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Unit weight (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="1.0" step="0.01" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Label template</span>
              <select className="w-full rounded-md border-gray-300"><option>STD-Flower-1g</option><option>STD-PreRoll-1g</option><option>Bulk-Trim</option></select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Expiration</span><input type="date" className="w-full rounded-md border-gray-300" /></label>
            <fieldset className="col-span-2 border-t border-gray-100 pt-3">
              <legend className="text-sm text-gray-700 mb-1">Assign package IDs</legend>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-sm"><span className="block text-gray-700 mb-1">Prefix</span><input className="w-full rounded-md border-gray-300" defaultValue="PKG" /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Start #</span><input type="number" className="w-full rounded-md border-gray-300" defaultValue={10001} /></label>
                <label className="text-sm"><span className="block text-gray-700 mb-1">Count</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="match Units" /></label>
              </div>
            </fieldset>
            <label className="text-sm"><span className="block text-gray-700 mb-1">THC mg</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 10" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">CBD mg</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="e.g., 0" /></label>
            <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked /> Child-resistant</label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Packaged by</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-pkg-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Label claims, warnings, etc." /></label>
          </div>
        </Drawer>
      )}

      {showTransfer && (
        <Drawer title="Transfer / Manifest" onClose={() => setShowTransfer(false)} onSubmit={() => setShowTransfer(false)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm"><span className="block text-gray-700 mb-1">Manifest ID</span><input className="w-full rounded-md border-gray-300" placeholder="MAN-2025-0902-01" defaultValue={`MAN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Transport method</span>
              <select className="w-full rounded-md border-gray-300"><option>Secure courier</option><option>Licensed transport</option><option>In-house driver</option></select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">From facility</span>
              <select className="w-full rounded-md border-gray-300">{facilities.length?facilities.map(f=>(<option key={f}>{f}</option>)):<option>Farm HQ</option>}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">To licensee</span>
              <select className="w-full rounded-md border-gray-300">{licensees.map(n=>(<option key={n}>{n}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Destination address</span><input className="w-full rounded-md border-gray-300" placeholder="123 Main St, Castries" defaultValue="123 Main St, Castries" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Pickup</span><input type="datetime-local" className="w-full rounded-md border-gray-300" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">ETA</span><input type="datetime-local" className="w-full rounded-md border-gray-300" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Driver</span>
              <select className="w-full rounded-md border-gray-300">{drivers.map(d=>(<option key={d}>{d}</option>))}</select>
            </label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Vehicle plate</span>
              <select className="w-full rounded-md border-gray-300">{plates.map(p=>(<option key={p}>{p}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Package IDs</span><textarea className="w-full rounded-md border-gray-300" rows={3} placeholder="PKG-1001, PKG-1002, ..." /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Seal numbers</span><input className="w-full rounded-md border-gray-300" placeholder="SL-9912, SL-9913" /></label>
            <label className="text-sm inline-flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked /> Escort required</label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Released by</span>
              <select className="w-full rounded-md border-gray-300">{staff.map(s=>(<option key={`stf-tr-${s}`}>{s}</option>))}</select>
            </label>
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Security seals, custody steps, etc." /></label>
          </div>
        </Drawer>
      )}
    </div>
  );
}
function Action({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 ring-1 ring-gray-100 shadow-sm"
      onClick={onClick}
    >
      <span className="text-emerald-700">{icon}</span>
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  );
}
function Drawer({ title, children, onClose, onSubmit }: { title: string; children: React.ReactNode; onClose: () => void; onSubmit?: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[32rem] bg-white shadow-2xl border-l border-gray-200 overflow-auto">
        <div className="p-4 flex items-start justify-between bg-gray-50 border-b border-gray-200">
          <div>
            <div className="text-xs text-gray-500">Production action</div>
            <div className="text-lg font-semibold text-gray-900">{title}</div>
          </div>
          <button className="text-gray-600 hover:text-gray-900" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="px-4 pb-24">
          <div className="rounded-lg border border-gray-200 p-4 mt-3 bg-white">
            {children}
          </div>
        </div>
        <div className="sticky bottom-0 inset-x-0 p-3 border-t border-gray-200 bg-white flex items-center justify-end gap-2">
          <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:opacity-95" onClick={onSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const s = (stage || '').toLowerCase();
  const label = s.startsWith('veg') ? 'Vegetative' : s.startsWith('flow') ? 'Flowering' : s.includes('harvest') ? 'Harvest' : s.includes('dry') ? 'Drying' : stage || 'Unknown';
  const cls = s.startsWith('veg')
    ? 'bg-emerald-100 text-emerald-700'
    : s.startsWith('flow')
    ? 'bg-amber-100 text-amber-700'
    : s.includes('harvest')
    ? 'bg-purple-100 text-purple-700'
    : s.includes('dry')
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${cls}`}>{label}</span>;
}

function HarvestStatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const label = s === 'dried' ? 'Dried' : s === 'drying' ? 'Drying' : status || '—';
  const cls = s === 'dried' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${cls}`}>{label}</span>;
}
