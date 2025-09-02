import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ShoppingCart, Package, DollarSign, TrendingUp, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  // Retail-focused KPIs (mock)
  const kpis = [
    { label: "Today's sales", value: '$2,460', icon: <DollarSign className="h-5 w-5" aria-hidden />, to: '/reports' },
    { label: 'Transactions', value: 86, icon: <ShoppingCart className="h-5 w-5" aria-hidden />, to: '/pos' },
    { label: 'Avg basket', value: '$28.60', icon: <TrendingUp className="h-5 w-5" aria-hidden />, to: '/reports' },
    { label: 'Low stock items', value: 7, icon: <Package className="h-5 w-5" aria-hidden />, to: '/pos' },
    { label: 'Customers today', value: 83, icon: <Users className="h-5 w-5" aria-hidden />, to: '/calendar' },
    { label: 'Open orders', value: 4, icon: <ShoppingCart className="h-5 w-5" aria-hidden />, to: '/pos' },
  ];

  // License mix by type (mocked)
  const licenseMix = [
    { type: 'Cultivation', active: 62, pending: 5, suspended: 1, expired: 2 },
    { type: 'Manufacturing', active: 28, pending: 3, suspended: 0, expired: 1 },
    { type: 'Laboratory', active: 9, pending: 1, suspended: 0, expired: 0 },
    { type: 'Retail', active: 29, pending: 4, suspended: 1, expired: 0 },
  ];

  // Pipeline snapshot (mocked)
  const pipeline = {
    plants: { vegetative: 5400, flowering: 3100, drying: 420 },
    batches: { awaitingCoa: 11, failed7d: 1, readyForSale: 76 },
  };

  // Recent movements removed per request (card removed)

  // Alerts (mocked)
  type EventLite = { id: number; title: string; eventType: string; startDate: string };
  const [events, setEvents] = useState<EventLite[]>([]);

  async function sha256Hex(input: string): Promise<string> {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  useEffect(() => {
    // Retail calendar preview: use a small curated set
    function daysFromNow(n: number) {
      const d = new Date(Date.now() + n * 86400000);
      return d.toISOString();
    }
    setEvents([
      { id: -1, title: 'Delivery: Distributor SLU', eventType: 'delivery', startDate: daysFromNow(1) },
      { id: -2, title: 'Staff shift: Morning', eventType: 'shift', startDate: daysFromNow(0) },
      { id: -3, title: 'Promo: Seniors Day', eventType: 'promo', startDate: daysFromNow(3) },
      { id: -4, title: 'Inventory audit', eventType: 'inventory', startDate: daysFromNow(5) },
    ]);
  }, []);

  // Featured inspection/schedule items (mocked, merged before API events)
  function daysFromNow(n: number) {
    const d = new Date(Date.now() + n * 86400000);
    return d.toISOString();
  }
  const featuredEvents: EventLite[] = [
    { id: -1, title: 'COA Due: Batch B-23-115', eventType: 'deadline', startDate: daysFromNow(4) },
    { id: -2, title: 'Enforcement Action Review', eventType: 'meeting', startDate: daysFromNow(4) },
    { id: -3, title: 'Follow-up CAPA', eventType: 'task', startDate: daysFromNow(6) },
    { id: -4, title: 'Compliance Audit: Regulatory Office', eventType: 'audit', startDate: daysFromNow(7) },
    { id: -5, title: 'Sampling: Authority HQ', eventType: 'sampling', startDate: daysFromNow(7) },
    { id: -6, title: 'License Renewal Checkpoint', eventType: 'deadline', startDate: daysFromNow(8) },
    { id: -7, title: 'Inspection: Accredited Lab SLU', eventType: 'inspection', startDate: daysFromNow(8) },
    { id: -8, title: 'Recall Follow-up: Batch B-23-108', eventType: 'task', startDate: daysFromNow(9) },
  ];
  const visibleEvents = [...events];

  const lowStock = [
    { sku: 'FLOW-35G-BD', name: 'Blue Dream 3.5g', left: 12 },
    { sku: 'PR-1G-GG', name: 'Pre-roll 1g Gorilla Glue', left: 18 },
    { sku: 'OIL-1ML-THC', name: 'Oil Tincture 1ml (THC)', left: 8 },
    { sku: 'ED-CHOC-10', name: 'Chocolate 10mg (10ct)', left: 14 },
  ];

  return (
  <div className="space-y-4">

      {/* KPIs */}
  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KPI key={k.label} label={k.label} value={k.value} icon={<div className="text-emerald-600">{k.icon}</div>} to={k.to} />
        ))}
      </div>

      {/* Low stock & quick sales snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Low stock" to="/pos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lowStock.map((i) => (
              <div key={i.sku} className="rounded-md border border-gray-200 p-2 text-sm flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-gray-800">
                  <Package className="h-4 w-4 text-amber-600" aria-hidden />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-xs text-gray-500">{i.sku}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{i.left} left</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Today at a glance" to="/reports">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-600" /> Gross sales</span><span>$2,460</span></li>
            <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-emerald-600" /> Transactions</span><span>86</span></li>
            <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Avg basket</span><span>$28.60</span></li>
            <li className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-emerald-600" /> New customers</span><span>12</span></li>
          </ul>
        </Card>
      </div>

      {/* Upcoming schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Schedule" to="/calendar">
          <div className="mt-1 max-h-[160px] overflow-auto pr-1">
            <ul className="space-y-2 text-sm text-gray-700">
              {visibleEvents.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-2">
                  <div className="inline-flex items-start gap-2 min-w-0">
                    <CalendarIcon className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" aria-hidden />
                    <span className="font-medium truncate">{e.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums ml-2">{new Date(e.startDate).toLocaleDateString()}</span>
                </li>
              ))}
              {visibleEvents.length === 0 && <li className="text-xs text-gray-500">No scheduled items.</li>}
            </ul>
          </div>
        </Card>
        <Card title="Alerts" to="/pos">
          <div className="mt-1 max-h-[160px] overflow-auto pr-1">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>3 items at or below reorder threshold</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>1 return pending manager approval</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Retail insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Top products today" to="/reports">
          <ul className="divide-y divide-gray-100">
            {[
              { sku: 'FLOW-35G-BD', name: 'Blue Dream 3.5g', qty: 42, sales: 1470 },
              { sku: 'PR-1G-GG', name: 'Pre-roll 1g Gorilla Glue', qty: 38, sales: 380 },
              { sku: 'ED-CHOC-10', name: 'Chocolate 10mg (10ct)', qty: 21, sales: 462 },
              { sku: 'OIL-1ML-THC', name: 'Oil Tincture 1ml (THC)', qty: 12, sales: 576 },
              { sku: 'FLOW-7G-OG', name: 'OG Kush 7g', qty: 9, sales: 540 },
            ].map((p) => (
              <li key={p.sku} className="py-2 px-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sku}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-gray-900">{p.qty} sold</div>
                  <div className="text-xs text-gray-500">${p.sales.toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Sales by category" to="/reports">
          <ul className="space-y-2 text-sm">
            {[{label:'Flower',v:46},{label:'Pre-roll',v:22},{label:'Edible',v:18},{label:'Oil',v:9},{label:'Other',v:5}].map((c)=> (
              <li key={c.label}>
                <div className="flex items-center justify-between text-gray-700">
                  <span>{c.label}</span>
                  <span className="tabular-nums">{c.v}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{width:`${c.v}%`}} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Staff + Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Budtender leaderboard" to="/reports">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'A. Joseph', tx: 31, sales: 840 },
              { name: 'K. Pierre', tx: 27, sales: 760 },
              { name: 'M. Charles', tx: 18, sales: 520 },
              { name: 'S. Smith', tx: 10, sales: 340 },
            ].map((b) => (
              <div key={b.name} className="rounded-md border border-gray-200 p-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{b.name}</div>
                <div className="text-xs text-gray-600">{b.tx} tx • ${b.sales}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Open returns/voids" to="/reports">
          <ul className="space-y-2 text-sm">
            {[{id:'RET-201', sku:'PR-1G-GG', reason:'Damaged', amt:10},{id:'VOID-112', sku:'FLOW-35G-BD', reason:'Cash drawer error', amt:35}].map((r)=> (
              <li key={r.id} className="flex items-center justify-between">
                <span className="truncate">{r.id} • {r.sku}</span>
                <span className="text-xs text-gray-500">{r.reason} • ${r.amt}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

  {/* Facility utilization card removed per request */}

  {/* Three-up row could host additional widgets later */}
    </div>
  );
}

function Badge({ label, tone = 'success' }: { label: string; tone?: 'success' | 'neutral' }) {
  const styles =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-gray-50 text-gray-700 ring-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${styles}`}>{label}</span>
  );
}

function QuickLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
    >
      <span className="inline-flex items-center gap-2 text-gray-800">
        <span className="text-emerald-700">{icon}</span>
        {label}
      </span>
  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
    </Link>
  );
}

// Small UI helpers
function StatusStat({ label, value, tone = 'gray' }: { label: string; value: number | string; tone?: 'emerald' | 'amber' | 'rose' | 'gray' }) {
  const toneMap: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    amber: 'text-amber-700 bg-amber-50 ring-amber-200',
    rose: 'text-rose-700 bg-rose-50 ring-rose-200',
    gray: 'text-gray-700 bg-gray-50 ring-gray-200',
  };
  return (
    <div className={`rounded-md px-2 py-1 ring-1 ${toneMap[tone]}`}>
      <div className="text-[10px] leading-tight">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function StackedBar({ parts }: { parts: Array<{ value: number; tone: 'emerald' | 'amber' | 'rose' | 'gray' }> }) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  const toneMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gray: 'bg-gray-300',
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
      {parts.map((p, i) => (
        <div key={i} className={`${toneMap[p.tone]} h-2`} style={{ width: `${(p.value / total) * 100}%` }} />
      ))}
    </div>
  );
}

function Bar({ label, value, max, tone = 'emerald' }: { label: string; value: number; max: number; tone?: 'emerald' | 'amber' | 'sky' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const toneMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
        <div className={`${toneMap[tone]} h-2`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = 'gray' }: { icon: React.ReactNode; label: string; value: number | string; tone?: 'gray' | 'emerald' | 'rose' }) {
  const toneMap: Record<string, string> = {
    gray: 'text-gray-700',
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
  };
  return (
    <div className="rounded-lg border border-gray-200 p-2">
      <div className={`inline-flex items-center gap-2 text-xs ${toneMap[tone]}`}> {icon} {label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  let tone = 'bg-emerald-500';
  if (pct >= 90) tone = 'bg-rose-500';
  else if (pct >= 70) tone = 'bg-amber-500';
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
      <div className={`${tone} h-2`} style={{ width: `${pct}%` }} />
    </div>
  );
}
