import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
import { Plus, Leaf, Scissors, Beaker, Package, Truck, Wind, Timer } from 'lucide-react';

export default function Production() {
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newPlant, setNewPlant] = useState({ strain: '', location: '' });

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

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [pl, hv] = await Promise.all([api.getPlants(), api.getHarvests()]);
    setPlants(pl);
    setHarvests(hv);
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

  const stageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plants) counts[p.stage] = (counts[p.stage] || 0) + 1;
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Production</h1>
          <p className="text-sm text-gray-600">Plants, batches, and seed-to-sale actions</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-500">Plants</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{plants.length.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">{Object.entries(stageStats).map(([k,v])=>`${k}: ${v}`).join(' • ') || '—'}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-500">Harvests (total)</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{harvests.length.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">Recent entries listed below</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-500">Active batches (mock)</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{Math.max(1, Math.round(plants.length/40))}</div>
          <div className="mt-1 text-xs text-gray-500">Derived from plant count</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Plants">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">{plants.length} records</div>
            <div className="inline-flex items-center gap-2">
              <input
                placeholder="Strain"
                value={newPlant.strain}
                onChange={(e) => setNewPlant({ ...newPlant, strain: e.target.value })}
                className="rounded-md border-gray-300 px-2 py-1 text-sm"
              />
              <input
                placeholder="Location"
                value={newPlant.location}
                onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                className="rounded-md border-gray-300 px-2 py-1 text-sm"
              />
              <button
                onClick={createPlant}
                disabled={creating || !newPlant.strain || !newPlant.location}
                className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" aria-hidden /> Add plant
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[24rem] rounded-lg border border-gray-100">
            <table className="min-w-full w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 bg-gray-50">
                  <th className="py-2 px-3 font-semibold">Plant</th>
                  <th className="py-2 px-3 font-semibold">Strain</th>
                  <th className="py-2 px-3 font-semibold">Stage</th>
                  <th className="py-2 px-3 font-semibold">Location</th>
                  <th className="py-2 px-3 font-semibold">Planted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plants.map((p) => (
                  <tr key={p.id} className="text-gray-800">
                    <td className="py-2 px-3 font-mono">{p.id}</td>
                    <td className="py-2 px-3">{p.strain}</td>
                    <td className="py-2 px-3"><StageBadge stage={p.stage} /></td>
                    <td className="py-2 px-3">{p.location}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">{p.plantedAt ? new Date(p.plantedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {plants.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-gray-500">No plants yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

    <Card title="Quick actions">
          <div className="grid grid-cols-2 gap-2 text-sm">
      <Action label="Germination" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowGermination(true)} />
      <Action label="Transplant" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowTransplant(true)} />
      <Action label="Flip to flower" icon={<Leaf className="h-4 w-4" />} onClick={() => setShowFlipToFlower(true)} />
      <Action label="Harvest" icon={<Scissors className="h-4 w-4" />} onClick={() => setShowHarvest(true)} />
      <Action label="Start drying" icon={<Wind className="h-4 w-4" />} onClick={() => setShowStartDrying(true)} />
      <Action label="End drying" icon={<Timer className="h-4 w-4" />} onClick={() => setShowEndDrying(true)} />
      <Action label="Lab submission" icon={<Beaker className="h-4 w-4" />} onClick={() => setShowLabSubmission(true)} />
      <Action label="Packaging" icon={<Package className="h-4 w-4" />} onClick={() => setShowPackaging(true)} />
      <Action label="Transfer" icon={<Truck className="h-4 w-4" />} onClick={() => setShowTransfer(true)} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card title="Recent harvests">
          <div className="overflow-auto max-h-[20rem] rounded-lg border border-gray-100">
            <table className="min-w-full w-full text-sm">
              <thead>
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
                  <tr key={h.id} className="text-gray-800">
                    <td className="py-2 px-3 font-mono">{h.id}</td>
                    <td className="py-2 px-3 font-mono">{h.plantId}</td>
                    <td className="py-2 px-3">{h.yieldGrams}</td>
                    <td className="py-2 px-3">{h.status}</td>
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
            <label className="text-sm"><span className="block text-gray-700 mb-1">Harvest date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Wet weight (g)</span><input type="number" className="w-full rounded-md border-gray-300" placeholder="12450" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Method</span>
              <select className="w-full rounded-md border-gray-300"><option>Whole plant</option><option>Section</option><option>Selective</option></select>
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
            <label className="text-sm"><span className="block text-gray-700 mb-1">Chain-of-custody ID</span><input className="w-full rounded-md border-gray-300" placeholder="COC-9723" /></label>
            <label className="text-sm"><span className="block text-gray-700 mb-1">Drop-off date</span><input type="date" className="w-full rounded-md border-gray-300" defaultValue={new Date().toISOString().slice(0,10)} /></label>
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
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Any QC, stem snap test, aroma, etc." /></label>
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
            <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Notes</span><textarea className="w-full rounded-md border-gray-300" rows={2} placeholder="Security seals, custody steps, etc." /></label>
          </div>
        </Drawer>
      )}
    </div>
  );
}

function Action({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 ring-1 ring-gray-200" onClick={onClick}>
      <span className="text-emerald-700">{icon}</span>
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  );
}
function Drawer({ title, children, onClose, onSubmit }: { title: string; children: React.ReactNode; onClose: () => void; onSubmit?: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[30rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
        <div className="p-4 flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">Production action</div>
            <div className="text-lg font-semibold text-gray-900">{title}</div>
          </div>
          <button className="text-gray-600 hover:text-gray-900" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="px-4 pb-24">
          <div className="rounded-lg border border-gray-200 p-4 mt-2">
            {children}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-gray-200 bg-white flex items-center justify-end gap-2">
          <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:opacity-95" onClick={onSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const cls = stage === 'veg' ? 'bg-emerald-100 text-emerald-700' : stage === 'flower' ? 'bg-amber-100 text-amber-700' : stage === 'harvest' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${cls}`}>{stage}</span>;
}
