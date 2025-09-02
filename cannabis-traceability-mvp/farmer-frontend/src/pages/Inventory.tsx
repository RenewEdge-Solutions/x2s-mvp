import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { Plus, Package, Boxes, Layers } from 'lucide-react';

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

const seedInv: InvItem[] = Array.from({ length: 32 }).map((_, i) => {
  const categories: InvItem['category'][] = ['Flower', 'Trim', 'Pre-roll', 'Oil', 'Edible', 'Packaging', 'Nutrients', 'Supplies'];
  const cat = categories[i % categories.length];
  const strains = ['Blue Dream', 'OG Kush', 'Sour Diesel', 'Gelato', 'Gorilla Glue', 'Pineapple Express'];
  const fac = ['Farm HQ', 'Greenhouse 1', 'Greenhouse 2', 'Indoor Room 1', 'Indoor Room 2'];
  const loc = ['Dry Room 1', 'Cure Room A', 'Vault', 'Packaging Line', 'Veg Room 2', 'Flower Room 1'];
  const sku = `${cat.slice(0,3).toUpperCase()}-${(1000 + i).toString()}`;
  const uom = cat === 'Flower' || cat === 'Trim' ? (i % 4 === 0 ? 'kg' : 'g') : 'units';
  const qty = uom === 'units' ? 200 - (i * 3 % 50) : (uom === 'kg' ? 12 - (i % 4) : 5000 - (i * 91));
  return {
    id: `INV-${(20250900 + i).toString()}`,
    sku,
    name: cat === 'Pre-roll' ? `${strains[i % strains.length]} 1g pre-roll` : cat === 'Packaging' ? 'Child-resistant Jars (90mm)' : cat,
    category: cat,
    strain: ['Flower','Trim','Pre-roll','Oil'].includes(cat) ? strains[i % strains.length] : undefined,
    batchId: ['Flower','Trim','Pre-roll','Oil'].includes(cat) ? `B-23-${100 + (i % 20)}` : undefined,
    facility: fac[i % fac.length],
    location: loc[i % loc.length],
    quantity: Math.max(0, qty),
    uom: uom as InvItem['uom'],
    status: (['Available','Quarantined','Locked','Reserved'] as InvItem['status'][])[i % 4],
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

export default function Inventory() {
  const [items, setItems] = useState<InvItem[]>(seedInv);
  const [openAdd, setOpenAdd] = useState(false);
  const [filters, setFilters] = useState({ q: '', category: 'All', status: 'All' });

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const statuses = ['All', 'Available', 'Quarantined', 'Locked', 'Reserved'];
  const totalQty = items.reduce((sum, it) => sum + (it.uom === 'units' ? 0 : it.quantity), 0);
  const unitCount = items.filter(i => i.uom === 'units').reduce((sum, it) => sum + it.quantity, 0);
  const batches = Array.from(new Set(items.map(i => i.batchId).filter(Boolean))) as string[];

  const filtered = items.filter(it => {
    const byQ = filters.q ? `${it.name} ${it.sku} ${it.strain||''} ${it.batchId||''}`.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const byC = filters.category === 'All' ? true : it.category === (filters.category as any);
    const byS = filters.status === 'All' ? true : it.status === (filters.status as any);
    return byQ && byC && byS;
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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-600">Realistic inventory across products, packaging, and supplies</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm" onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4" aria-hidden /> Add item
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div className="text-xs text-gray-500">Distinct items</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{items.length}</div>
          <div className="mt-1 text-xs text-gray-500">{categories.length - 1} categories</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Total weight (g)</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{Math.round(totalQty).toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">Excludes unit-only items</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Unit count</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{unitCount.toLocaleString()}</div>
          <div className="mt-1 text-xs text-gray-500">Pre-rolls, packaging, supplies</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search name, SKU, strain, or batch"
            className="rounded-md border-gray-300 px-2 py-1 text-sm min-w-[18rem]"
            value={filters.q}
            onChange={(e)=>setFilters({...filters, q: e.target.value})}
          />
          <select className="rounded-md border-gray-300 px-2 py-1 text-sm" value={filters.category} onChange={(e)=>setFilters({...filters, category: e.target.value})}>
            {categories.map(c => (<option key={c}>{c}</option>))}
          </select>
          <select className="rounded-md border-gray-300 px-2 py-1 text-sm" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
            {statuses.map(s => (<option key={s}>{s}</option>))}
          </select>
          <div className="ml-auto text-xs text-gray-500">{filtered.length} items</div>
        </div>
      </Card>

      <Card title="Items">
        <div className="overflow-auto max-h-[28rem] rounded-lg border border-gray-100">
          <table className="min-w-full w-full text-sm">
            <thead>
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
                <th className="py-2 px-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((it) => (
                <tr key={it.id} className="text-gray-800">
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
                  <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600">{new Date(it.updatedAt).toLocaleDateString()}</td>
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
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[30rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
        <div className="p-4 flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">Inventory</div>
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
