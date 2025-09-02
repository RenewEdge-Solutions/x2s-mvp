import React, { useEffect, useState } from 'react';
import { BadgeCheck, Calendar as CalendarIcon, ClipboardList, AlertTriangle, Beaker, Activity, Leaf, Package, Truck } from 'lucide-react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  // Static demo metrics (mock-first, no backend required)
  const kpis = [
    { label: 'Plants (veg)', value: 5400, icon: <Leaf className="h-5 w-5" aria-hidden />, to: '/production' },
    { label: 'Plants (flower)', value: 3100, icon: <Leaf className="h-5 w-5" aria-hidden />, to: '/production' },
    { label: 'Batches awaiting COA', value: 11, icon: <ClipboardList className="h-5 w-5" aria-hidden />, to: '/lifecycle' },
    { label: 'COA pass rate', value: '93%', icon: <Beaker className="h-5 w-5" aria-hidden />, to: '/reports' },
    { label: 'Ready for sale', value: 76, icon: <Package className="h-5 w-5" aria-hidden />, to: '/lifecycle' },
    { label: 'Transfers pending', value: 4, icon: <Truck className="h-5 w-5" aria-hidden />, to: '/production' },
  ];

  // License mix by type (mocked)
  const licenseMix: any[] = [];

  // Pipeline snapshot (mocked)
  const pipeline = {
    plants: { vegetative: 5400, flowering: 3100, drying: 420 },
    batches: { awaitingCoa: 11, failed7d: 1, readyForSale: 76 },
  };

  // Recent movements removed per request (card removed)

  // Alerts (mocked)
  type EventLite = { id: number; title: string; eventType: string; startDate: string };
  const [events, setEvents] = useState<EventLite[]>([]);
  const [integrity] = useState<{ total: number; verified: number; mismatched: number }>({ total: 0, verified: 0, mismatched: 0 });

  async function sha256Hex(input: string): Promise<string> {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  useEffect(() => {
    api.getEvents().then((evts) => setEvents((evts as EventLite[])));
  }, []);

  // Featured inspection/schedule items (mocked, merged before API events)
  function daysFromNow(n: number) {
    const d = new Date(Date.now() + n * 86400000);
    return d.toISOString();
  }
  const featuredEvents: EventLite[] = [
    { id: -1, title: 'COA Due: Batch B-23-115', eventType: 'deadline', startDate: daysFromNow(4) },
  { id: -2, title: 'Transplant: Greenhouse 4 - Bed A', eventType: 'task', startDate: daysFromNow(3) },
  { id: -3, title: 'Drying check: DR-2', eventType: 'task', startDate: daysFromNow(5) },
  { id: -4, title: 'Lab submission: Batch B-23-115', eventType: 'sampling', startDate: daysFromNow(7) },
  { id: -5, title: 'Packaging run: FLOW-14G', eventType: 'task', startDate: daysFromNow(7) },
  { id: -6, title: 'Shipment prep: MAN-784-0110', eventType: 'deadline', startDate: daysFromNow(8) },
  ];
  const visibleEvents = [...featuredEvents, ...events];

  const expiringLicenses: any[] = [];

  return (
  <div className="space-y-4">
  {/* Page header removed per request */}

      {/* KPIs */}
  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KPI key={k.label} label={k.label} value={k.value} icon={<div className="text-emerald-600">{k.icon}</div>} to={k.to} />
        ))}
      </div>

  {/* Removed License overview for farmer */}

      {/* Pipeline + Compliance alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card className="lg:col-span-2" title="Production pipeline" to="/lifecycle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-700">Plants by stage</h4>
              <div className="mt-2 space-y-2">
                <Bar label="Vegetative" value={pipeline.plants.vegetative} max={6000} tone="emerald" />
                <Bar label="Flowering" value={pipeline.plants.flowering} max={6000} tone="amber" />
                <Bar label="Drying" value={pipeline.plants.drying} max={1000} tone="sky" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700">Batches</h4>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <MiniStat icon={<ClipboardList className="h-4 w-4" />} label="Awaiting COA" value={pipeline.batches.awaitingCoa} />
                <MiniStat icon={<Beaker className="h-4 w-4" />} label="Failed (7d)" value={pipeline.batches.failed7d} tone="rose" />
                <MiniStat icon={<Activity className="h-4 w-4" />} label="Ready for sale" value={pipeline.batches.readyForSale} tone="emerald" />
              </div>
            </div>
          </div>
        </Card>
  <Card title="Compliance & alerts" to="/facilities">
          <div className="mt-1 max-h-[160px] overflow-auto pr-1">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>11 batches awaiting COA across 4 labs</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" aria-hidden />
                <span>1 batch failed pesticide limits in last 7 days</span>
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden />
                <span>0 public recalls open</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>2 labs over SLA turnaround time</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>1 facility over capacity threshold</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>3 overdue CAPA actions</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>2 missing seed lot documents</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" aria-hidden />
                <span>1 suspected diversion flagged</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

  {/* Facility utilization card removed per request */}

      {/* Two-up row: Inspections and Production summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Inspections & schedule" to="/calendar">
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
        <Card title="Production summary" to="/production">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={<Leaf className="h-4 w-4" />} label="Veg" value={pipeline.plants.vegetative} />
            <MiniStat icon={<Leaf className="h-4 w-4" />} label="Flower" value={pipeline.plants.flowering} />
            <MiniStat icon={<Activity className="h-4 w-4" />} label="Ready" value={pipeline.batches.readyForSale} />
          </div>
        </Card>
      </div>
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

// QuickLink helper removed in farmer view

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
