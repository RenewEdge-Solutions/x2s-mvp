import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Plus, Package, Boxes, BarChart3 } from 'lucide-react';

type InvItem = {
  id: string;
  sku: string;
  name: string;
  category: 'Flower' | 'Trim' | 'Pre-roll' | 'Oil' | 'Edible' | 'Packaging' | 'Nutrients' | 'Supplies';
  strain?: string;
  batchId?: string;
  facility: string;
  location: string;
  quantity: number;
  uom: 'g' | 'kg' | 'units' | 'L';
  status: 'Available' | 'Quarantined' | 'Locked' | 'Reserved';
  updatedAt: string; // ISO
};

const seedInv: InvItem[] = Array.from({ length: 120 }).map((_, i) => {
  const categories: InvItem['category'][] = ['Flower', 'Trim', 'Pre-roll', 'Oil', 'Edible', 'Packaging', 'Nutrients', 'Supplies'];
  const cat = categories[i % categories.length];
  const strains = ['Blue Dream', 'OG Kush', 'Sour Diesel', 'Gelato', 'Gorilla Glue', 'Pineapple Express', 'Wedding Cake', 'Runtz'];
  const fac = ['Farm HQ', 'Greenhouse 1', 'Greenhouse 2', 'Processing Plant', 'Indoor Room 1', 'Indoor Room 2'];
  const loc = ['Dry Room 1', 'Cure Room A', 'Vault', 'Packaging Line', 'Storage B', 'Receiving'];
  const sku = `${cat.slice(0,3).toUpperCase()}-${(1000 + i).toString()}`;
  const uom: InvItem['uom'] = cat === 'Flower' || cat === 'Trim' ? (i % 4 === 0 ? 'kg' : 'g') : (cat === 'Oil' ? 'L' : 'units');
  const qty =
    uom === 'units'
      ? 500 - ((i * 7) % 220)
      : uom === 'kg'
      ? 20 - (i % 5)
      : uom === 'L'
      ? 50 - (i % 11)
      : 8000 - (i * 77);
  const baseName =
    cat === 'Pre-roll'
      ? `${strains[i % strains.length]} 1g pre-roll`
      : cat === 'Packaging'
      ? ['Child-resistant Jar (90mm)', 'Mylar Bag (3.5g)', 'Tamper Seal Roll'][i % 3]
      : cat === 'Nutrients'
      ? ['Bloom A 5L', 'Bloom B 5L', 'Cal-Mag 1L'][i % 3]
      : cat === 'Supplies'
      ? ['RFID Tags', 'Trimming Gloves (L)', 'Isopropyl Alcohol 99%'][i % 3]
      : cat === 'Oil'
      ? `${strains[i % strains.length]} Distillate`
      : cat === 'Edible'
      ? `Gummies 10mg (${['Strawberry', 'Mango', 'Grape'][i % 3]})`
      : `${strains[i % strains.length]} ${cat}`;
  return {
    id: `INV-${(20250900 + i).toString()}`,
    sku,
    name: baseName,
    category: cat,
    strain: ['Flower','Trim','Pre-roll','Oil'].includes(cat) ? strains[i % strains.length] : undefined,
    batchId: ['Flower','Trim','Pre-roll','Oil','Edible'].includes(cat) ? `B-23-${100 + (i % 28)}` : undefined,
    facility: fac[i % fac.length],
    location: loc[i % loc.length],
    quantity: Math.max(0, qty),
    uom,
    status: (['Available','Quarantined','Locked','Reserved'] as InvItem['status'][])[i % 4],
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

export default function Inventory() {
  const [items, setItems] = useState<InvItem[]>(seedInv);
  const [openAdd, setOpenAdd] = useState(false);
  const [filters, setFilters] = useState({ q: '', category: 'All', status: 'All', strain: 'All', batch: 'All', facility: 'All', location: 'All' });

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const statuses = ['All', 'Available', 'Quarantined', 'Locked', 'Reserved'];
  const totalQty = items.reduce((sum, it) => sum + (it.uom === 'units' ? 0 : it.quantity), 0);
  const unitCount = items.filter(i => i.uom === 'units').reduce((sum, it) => sum + it.quantity, 0);
  const batches = Array.from(new Set(items.map(i => i.batchId).filter(Boolean))) as string[];
  const strains = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.strain).filter(Boolean))) as string[]], [items]);
  const batchOptions = useMemo(() => ['All', ...batches], [batches]);
  const facilities = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.facility)))], [items]);
  const locations = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.location)))], [items]);

  const filtered = items.filter(it => {
    const byQ = filters.q ? `${it.name} ${it.sku} ${it.strain||''} ${it.batchId||''}`.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const byC = filters.category === 'All' ? true : it.category === (filters.category as any);
    const byS = filters.status === 'All' ? true : it.status === (filters.status as any);
    const byStrain = filters.strain === 'All' ? true : (it.strain || '') === filters.strain;
    const byBatch = filters.batch === 'All' ? true : (it.batchId || '') === filters.batch;
    const byFacility = filters.facility === 'All' ? true : it.facility === filters.facility;
    const byLocation = filters.location === 'All' ? true : it.location === filters.location;
    return byQ && byC && byS && byStrain && byBatch && byFacility && byLocation;
  });

  function addItemMock(form: Partial<InvItem>) {
    const id = `INV-${Date.now()}`;
    const newItem: InvItem = {
      id,
      sku: form.sku || `NEW-${Math.floor(Math.random()*1000)}`,
      name: form.name || 'New Inventory Item',
      category: (form.category as any) || 'Supplies',
      strain: form.strain,
      batchId: form.batchId,
      facility: form.facility || 'Farm HQ',
      location: form.location || 'Vault',
      quantity: Number(form.quantity || 0),
      uom: (form.uom as any) || 'units',
      status: (form.status as any) || 'Available',
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2"><Package className="h-5 w-5 text-emerald-600" aria-hidden /> Inventory</h1>
        </div>
        <button
          className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50"
          onClick={() => setOpenAdd(true)}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add item
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KPI label="Distinct items" value={items.length} icon={<div className="text-emerald-600"><Package className="h-4 w-4" aria-hidden /></div>} />
        <KPI label="Total weight (g)" value={Math.round(totalQty).toLocaleString()} icon={<div className="text-emerald-600"><BarChart3 className="h-4 w-4" aria-hidden /></div>} />
        <KPI label="Unit count" value={unitCount.toLocaleString()} icon={<div className="text-emerald-600"><Boxes className="h-4 w-4" aria-hidden /></div>} />
      </div>

      {/* Items table with Excel-like header filters */}
      <Card title="Items">
        <div className="overflow-auto max-h-[800px] rounded-lg border border-gray-100">
          <table className="min-w-full w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-gray-600 bg-gray-50">
                <th className="py-2 px-3 font-semibold">SKU</th>
                <th className="py-2 px-3 font-semibold">Name</th>
                <th className="py-2 px-3 font-semibold">Category</th>
                <th className="py-2 px-3 font-semibold">Strain</th>
                <th className="py-2 px-3 font-semibold">Batch</th>
                <th className="py-2 px-3 font-semibold">Qty</th>
                <th className="py-2 px-3 font-semibold">UoM</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 px-3 font-semibold">Facility</th>
                <th className="py-2 px-3 font-semibold">Location</th>
                <th className="py-2 px-3 font-semibold text-right">Updated</th>
              </tr>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-2 px-3"><input placeholder="SKU" className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.q} onChange={(e)=>setFilters({...filters, q: e.target.value})} /></th>
                <th className="py-2 px-3"><input placeholder="Name, strain, batch" className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.q} onChange={(e)=>setFilters({...filters, q: e.target.value})} /></th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.category} onChange={(e)=>setFilters({...filters, category: e.target.value})}>
                    {categories.map(c => (<option key={c}>{c}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.strain} onChange={(e)=>setFilters({...filters, strain: e.target.value})}>
                    {strains.map(s => (<option key={s}>{s}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.batch} onChange={(e)=>setFilters({...filters, batch: e.target.value})}>
                    {batchOptions.map(b => (<option key={b}>{b}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                    {statuses.map(s => (<option key={s}>{s}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.facility} onChange={(e)=>setFilters({...filters, facility: e.target.value})}>
                    {facilities.map(f => (<option key={f}>{f}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.location} onChange={(e)=>setFilters({...filters, location: e.target.value})}>
                    {locations.map(l => (<option key={l}>{l}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3 text-right"><span className="text-[11px] text-gray-500">{filtered.length} items</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((it) => (
                <tr key={it.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono">{it.sku}</td>
                  <td className="py-2 px-3">{it.name}</td>
                  <td className="py-2 px-3">{it.category}</td>
                  <td className="py-2 px-3">{it.strain || '—'}</td>
                  <td className="py-2 px-3 font-mono">{it.batchId || '—'}</td>
                  <td className="py-2 px-3 text-right">{it.quantity.toLocaleString()}</td>
                  <td className="py-2 px-3">{it.uom}</td>
                  <td className="py-2 px-3"><StatusBadge status={it.status} /></td>
                  <td className="py-2 px-3">{it.facility}</td>
                  <td className="py-2 px-3">{it.location}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 text-right">{new Date(it.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={11} className="py-6 text-center text-gray-500">No items match current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {openAdd && (
        <Drawer title="Add Inventory Item" onClose={() => setOpenAdd(false)} onSubmit={() => setOpenAdd(false)}>
          <AddItemForm onSubmit={(f)=>{ addItemMock(f); setOpenAdd(false); }} batches={batches} />
        </Drawer>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: InvItem['status'] }) {
  const cls = status === 'Available' ? 'bg-emerald-100 text-emerald-700' : status === 'Quarantined' ? 'bg-amber-100 text-amber-700' : status === 'Locked' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${cls}`}>{status}</span>;
}

function Drawer({ title, children, onClose, onSubmit }: { title: string; children: React.ReactNode; onClose: () => void; onSubmit?: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[32rem] bg-white shadow-2xl border-l border-gray-200 overflow-auto">
        <div className="p-4 flex items-start justify-between bg-gray-50 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Inventory</div>
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

function AddItemForm({ onSubmit, batches }: { onSubmit: (form: Partial<InvItem>) => void; batches: string[] }) {
  const [form, setForm] = useState<Partial<InvItem>>({ category: 'Flower', uom: 'g', status: 'Available' });
  const categories: InvItem['category'][] = ['Flower', 'Trim', 'Pre-roll', 'Oil', 'Edible', 'Packaging', 'Nutrients', 'Supplies'];
  const facilities = ['Farm HQ', 'Greenhouse 1', 'Greenhouse 2', 'Indoor Room 1', 'Indoor Room 2'];
  const locations = ['Vault', 'Dry Room 1', 'Cure Room A', 'Packaging Line', 'Storage B'];

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e)=>{ e.preventDefault(); onSubmit(form); }}
    >
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">SKU</span><input className="w-full rounded-md border-gray-300" value={form.sku||''} onChange={(e)=>setForm({...form, sku: e.target.value})} placeholder="FLW-1203" /></label>
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Name</span><input className="w-full rounded-md border-gray-300" value={form.name||''} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Blue Dream Flower" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Category</span>
        <select className="w-full rounded-md border-gray-300" value={form.category as any} onChange={(e)=>setForm({...form, category: e.target.value as any})}>{categories.map(c=>(<option key={c}>{c}</option>))}</select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">UoM</span>
        <select className="w-full rounded-md border-gray-300" value={form.uom as any} onChange={(e)=>setForm({...form, uom: e.target.value as any})}>
          <option>g</option><option>kg</option><option>units</option><option>L</option>
        </select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Quantity</span><input type="number" className="w-full rounded-md border-gray-300" value={form.quantity as any || ''} onChange={(e)=>setForm({...form, quantity: Number(e.target.value)})} placeholder="1000" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Status</span>
        <select className="w-full rounded-md border-gray-300" value={form.status as any} onChange={(e)=>setForm({...form, status: e.target.value as any})}>
          <option>Available</option><option>Quarantined</option><option>Locked</option><option>Reserved</option>
        </select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Strain</span><input className="w-full rounded-md border-gray-300" value={form.strain||''} onChange={(e)=>setForm({...form, strain: e.target.value})} placeholder="Gelato" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Batch</span>
        <select className="w-full rounded-md border-gray-300" value={form.batchId||''} onChange={(e)=>setForm({...form, batchId: e.target.value})}>
          <option value="">—</option>
          {batches.map(b => (<option key={b} className="font-mono">{b}</option>))}
        </select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Facility</span>
        <select className="w-full rounded-md border-gray-300" value={form.facility||''} onChange={(e)=>setForm({...form, facility: e.target.value})}>{facilities.map(f=>(<option key={f}>{f}</option>))}</select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Location</span>
        <select className="w-full rounded-md border-gray-300" value={form.location||''} onChange={(e)=>setForm({...form, location: e.target.value})}>{locations.map(l=>(<option key={l}>{l}</option>))}</select>
      </label>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 rounded-md border text-sm" onClick={()=>onSubmit(form)}>Add item</button>
      </div>
    </form>
  );
}
