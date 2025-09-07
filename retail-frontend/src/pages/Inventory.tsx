import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Plus, Package, Boxes, BarChart3, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

type RetailItem = {
  id: string;
  sku: string;
  name: string;
  category: 'Flower' | 'Pre-roll' | 'Edible' | 'Oil' | 'Topical' | 'Accessory';
  brand?: string;
  batchId?: string;
  quantity: number; // units in stock
  reorderLevel: number; // threshold
  cost: number; // unit cost
  price: number; // retail price
  marginPct: number; // derived/tuned
  updatedAt: string; // ISO
  image?: string; // product photo
};

// Local image helper (shared convention with POS): place JPGs in /public/images/products named by SKU
const productImage = (sku: string) => `/images/products/${sku}.jpg`;
const fallbackThumb = (sku: string) => `https://picsum.photos/seed/${encodeURIComponent(sku)}/320/240`;

const seedRetail: RetailItem[] = Array.from({ length: 120 }).map((_, i) => {
  const categories: RetailItem['category'][] = ['Flower', 'Pre-roll', 'Edible', 'Oil', 'Topical', 'Accessory'];
  const cat = categories[i % categories.length];
  const brands = ['GreenLeaf', 'HighPeak', 'Sundrop', 'Elevate', 'Zen Labs', 'NorthStar'];
  const names = {
    Flower: ['Blue Dream 3.5g', 'OG Kush 7g', 'Sour Diesel 3.5g', 'Gelato 3.5g'],
    'Pre-roll': ['Gorilla Glue 1g PR', 'Hybrid PR 0.5g 2-pack', 'Sativa PR 1g'],
    Edible: ['Gummies 10mg (10ct)', 'Chocolate 10mg (10ct)', 'Caramels 5mg (20ct)'],
    Oil: ['THC Tincture 1ml', 'CBD Tincture 1ml', 'Balanced 1:1 1ml'],
    Topical: ['Relief Balm 50ml', 'Cooling Gel 100ml', 'Lotion 200ml'],
    Accessory: ['Grinder', 'Papers King Size', 'Pipe Glass Mini']
  } as const;

  const name = (names as any)[cat][i % (names as any)[cat].length];
  const brand = brands[i % brands.length];
  const sku = `${cat.slice(0,3).toUpperCase()}-${(2000 + i).toString()}`;
  const priceBase = cat === 'Flower' ? 35 : cat === 'Pre-roll' ? 10 : cat === 'Edible' ? 22 : cat === 'Oil' ? 48 : cat === 'Topical' ? 25 : 15;
  const price = +(priceBase + ((i % 5) - 2)).toFixed(2);
  const cost = +(price * (0.55 + (i % 4) * 0.05)).toFixed(2);
  const qty = 150 - ((i * 7) % 120);
  const reorder = 20 + (i % 10);

  return {
    id: `RET-${(20251000 + i).toString()}`,
    sku,
    name,
    category: cat,
    brand,
    batchId: ['Flower','Pre-roll','Oil','Edible'].includes(cat) ? `B-24-${100 + (i % 28)}` : undefined,
    quantity: Math.max(0, qty),
    reorderLevel: reorder,
    cost,
    price,
    marginPct: +(((price - cost) / price) * 100).toFixed(1),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    // Default to local product image path; UI will fallback if not present
    image: productImage(sku),
  };
});

export default function Inventory() {
  const [items, setItems] = useState<RetailItem[]>(seedRetail);
  const [openAdd, setOpenAdd] = useState(false);
  const [filters, setFilters] = useState({ q: '', category: 'All', brand: 'All', lowStockOnly: false });

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category)))], [items]);
  const brands = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.brand).filter(Boolean))) as string[]], [items]);

  const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;
  const retailValue = items.reduce((s, it) => s + it.quantity * it.price, 0);
  const costValue = items.reduce((s, it) => s + it.quantity * it.cost, 0);

  const filtered = items.filter(it => {
    const byQ = filters.q ? `${it.name} ${it.sku} ${it.brand||''}`.toLowerCase().includes(filters.q.toLowerCase()) : true;
    const byC = filters.category === 'All' ? true : it.category === (filters.category as any);
    const byB = filters.brand === 'All' ? true : (it.brand || '') === filters.brand;
    const byLow = !filters.lowStockOnly || it.quantity <= it.reorderLevel;
    return byQ && byC && byB && byLow;
  });

  function addItemMock(form: Partial<RetailItem>) {
    const id = `RET-${Date.now()}`;
    const price = Number(form.price || 0);
    const cost = Number(form.cost || 0);
    const newItem: RetailItem = {
      id,
      sku: form.sku || `NEW-${Math.floor(Math.random()*1000)}`,
      name: form.name || 'New Retail Item',
      category: (form.category as any) || 'Accessory',
      brand: form.brand || 'House',
      batchId: form.batchId,
      quantity: Number(form.quantity || 0),
      reorderLevel: Number(form.reorderLevel || 10),
      cost,
      price,
      marginPct: price ? +(((price - cost) / price) * 100).toFixed(1) : 0,
      updatedAt: new Date().toISOString(),
  image: form.image || (form.sku ? productImage(form.sku) : undefined),
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <KPI label="Distinct items" value={items.length} icon={<div className="text-emerald-600"><Package className="h-4 w-4" aria-hidden /></div>} />
        <KPI label="On-hand units" value={items.reduce((s,i)=>s+i.quantity,0).toLocaleString()} icon={<div className="text-emerald-600"><Boxes className="h-4 w-4" aria-hidden /></div>} />
        <KPI label="Retail value" value={`$${retailValue.toLocaleString(undefined,{maximumFractionDigits:0})}`} icon={<div className="text-emerald-600"><DollarSign className="h-4 w-4" aria-hidden /></div>} />
        <KPI label="Low stock" value={lowStockCount} icon={<div className="text-emerald-600"><TrendingDown className="h-4 w-4" aria-hidden /></div>} />
      </div>

      {/* Items table with header filters */}
      <Card title="Items">
        <div className="overflow-auto max-h-[800px] rounded-lg border border-gray-100">
          <table className="min-w-full w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-gray-600 bg-gray-50">
                <th className="py-2 px-3 font-semibold">Photo</th>
                <th className="py-2 px-3 font-semibold">SKU</th>
                <th className="py-2 px-3 font-semibold">Name</th>
                <th className="py-2 px-3 font-semibold">Category</th>
                <th className="py-2 px-3 font-semibold">Brand</th>
                <th className="py-2 px-3 font-semibold text-right">Qty</th>
                <th className="py-2 px-3 font-semibold text-right">Reorder</th>
                <th className="py-2 px-3 font-semibold text-right">Cost</th>
                <th className="py-2 px-3 font-semibold text-right">Price</th>
                <th className="py-2 px-3 font-semibold text-right">Margin</th>
                <th className="py-2 px-3 font-semibold text-right">Updated</th>
              </tr>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3"><input placeholder="SKU" className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.q} onChange={(e)=>setFilters({...filters, q: e.target.value})} /></th>
                <th className="py-2 px-3"><input placeholder="Name or brand" className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.q} onChange={(e)=>setFilters({...filters, q: e.target.value})} /></th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.category} onChange={(e)=>setFilters({...filters, category: e.target.value})}>
                    {categories.map(c => (<option key={c}>{c}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3">
                  <select className="w-full rounded-md border-gray-300 px-2 py-1 text-xs" value={filters.brand} onChange={(e)=>setFilters({...filters, brand: e.target.value})}>
                    {brands.map(b => (<option key={b}>{b}</option>))}
                  </select>
                </th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3 text-right">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                    <input type="checkbox" checked={filters.lowStockOnly} onChange={(e)=>setFilters({...filters, lowStockOnly: e.target.checked})} /> Low stock only
                  </label>
                </th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3 text-right"><span className="text-[11px] text-gray-500">{filtered.length} items</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((it) => (
                <tr key={it.id} className={`text-gray-800 hover:bg-gray-50 ${it.quantity <= it.reorderLevel ? 'bg-amber-50/40' : ''}`}>
                  <td className="py-2 px-3">
                    {(
                      <img
                        src={it.image || productImage(it.sku)}
                        alt=""
                        className="h-10 w-14 rounded object-cover bg-gray-100"
                        onError={(e) => { const sku = it.sku; const t = e.currentTarget; if (t.src !== fallbackThumb(sku)) { t.src = fallbackThumb(sku); } }}
                      />
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono">{it.sku}</td>
                  <td className="py-2 px-3">{it.name}</td>
                  <td className="py-2 px-3">{it.category}</td>
                  <td className="py-2 px-3">{it.brand || '—'}</td>
                  <td className="py-2 px-3 text-right">{it.quantity.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">{it.reorderLevel}</td>
                  <td className="py-2 px-3 text-right">${it.cost.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">${it.price.toFixed(2)}</td>
                  <td className={`py-2 px-3 text-right ${it.marginPct < 40 ? 'text-amber-700' : 'text-emerald-700'}`}>{it.marginPct}%</td>
                  <td className="py-2 px-3 whitespace-nowrap text-xs text-gray-600 text-right">{new Date(it.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={10} className="py-6 text-center text-gray-500">No items match current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {openAdd && (
        <Drawer title="Add Retail Item" onClose={() => setOpenAdd(false)} onSubmit={() => setOpenAdd(false)}>
          <AddItemForm onSubmit={(f)=>{ addItemMock(f); setOpenAdd(false); }} />
        </Drawer>
      )}
    </div>
  );
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

function AddItemForm({ onSubmit }: { onSubmit: (form: Partial<RetailItem>) => void }) {
  const [form, setForm] = useState<Partial<RetailItem>>({ category: 'Flower' });
  const categories: RetailItem['category'][] = ['Flower', 'Pre-roll', 'Edible', 'Oil', 'Topical', 'Accessory'];

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e)=>{ e.preventDefault(); onSubmit(form); }}
    >
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">SKU</span><input className="w-full rounded-md border-gray-300" value={form.sku||''} onChange={(e)=>setForm({...form, sku: e.target.value})} placeholder="FLW-2001" /></label>
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Name</span><input className="w-full rounded-md border-gray-300" value={form.name||''} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Blue Dream 3.5g" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Category</span>
        <select className="w-full rounded-md border-gray-300" value={form.category as any} onChange={(e)=>setForm({...form, category: e.target.value as any})}>{categories.map(c=>(<option key={c}>{c}</option>))}</select>
      </label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Brand</span><input className="w-full rounded-md border-gray-300" value={form.brand||''} onChange={(e)=>setForm({...form, brand: e.target.value})} placeholder="House" /></label>
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Photo URL</span><input className="w-full rounded-md border-gray-300" value={form.image||''} onChange={(e)=>setForm({...form, image: e.target.value})} placeholder="https://..." /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Quantity</span><input type="number" className="w-full rounded-md border-gray-300" value={form.quantity as any || ''} onChange={(e)=>setForm({...form, quantity: Number(e.target.value)})} placeholder="100" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Reorder level</span><input type="number" className="w-full rounded-md border-gray-300" value={form.reorderLevel as any || ''} onChange={(e)=>setForm({...form, reorderLevel: Number(e.target.value)})} placeholder="20" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Cost</span><input type="number" className="w-full rounded-md border-gray-300" value={form.cost as any || ''} onChange={(e)=>setForm({...form, cost: Number(e.target.value)})} placeholder="15" /></label>
      <label className="text-sm"><span className="block text-gray-700 mb-1">Price</span><input type="number" className="w-full rounded-md border-gray-300" value={form.price as any || ''} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} placeholder="25" /></label>
      <label className="text-sm col-span-2"><span className="block text-gray-700 mb-1">Batch (optional)</span><input className="w-full rounded-md border-gray-300" value={form.batchId||''} onChange={(e)=>setForm({...form, batchId: e.target.value})} placeholder="B-24-123" /></label>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 rounded-md border text-sm" onClick={()=>onSubmit(form)}>Add item</button>
      </div>
    </form>
  );
}
