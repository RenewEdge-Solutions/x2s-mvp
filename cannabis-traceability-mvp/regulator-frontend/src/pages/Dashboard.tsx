import React, { useEffect, useState } from 'react';
import { BadgeCheck, FileBarChart2, Scale, Shield, Calendar as CalendarIcon, Workflow, Sparkles, Waypoints, ClipboardList, AlertTriangle, Beaker, Truck, Activity, Building2, Users } from 'lucide-react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  // Static demo metrics (mock-first, no backend required)
  const kpis = [
    { label: 'Active licenses', value: 128, icon: <Scale className="h-5 w-5" aria-hidden /> },
    { label: 'Facilities', value: 42, icon: <Building2 className="h-5 w-5" aria-hidden /> },
    { label: 'Open investigations', value: 3, icon: <Shield className="h-5 w-5" aria-hidden /> },
    { label: 'Batches awaiting COA', value: 11, icon: <ClipboardList className="h-5 w-5" aria-hidden /> },
    { label: 'Compliance alerts', value: 6, icon: <AlertTriangle className="h-5 w-5" aria-hidden /> },
    { label: 'COA pass rate', value: '93%', icon: <Beaker className="h-5 w-5" aria-hidden /> },
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

  // Recent movements (mocked)
  const transfers = [
    { id: 't-9001', from: 'Farm HQ', to: 'Lab Nova', items: 3, status: 'In transit', ts: '10:21' },
    { id: 't-9002', from: 'Processor A', to: 'Retail East', items: 5, status: 'Received', ts: '09:55' },
    { id: 't-9003', from: 'Farm West', to: 'Lab Nova', items: 2, status: 'Picked up', ts: '08:40' },
  ];

  // Alerts (mocked)
  type OccupancyRow = { structureId: string; structure: string; facility: string; occupied: number; capacity: number };
  type EventLite = { id: number; title: string; eventType: string; startDate: string };
  const [occupancy, setOccupancy] = useState<OccupancyRow[]>([]);
  const [events, setEvents] = useState<EventLite[]>([]);

  useEffect(() => {
    // Load light-weight mock data from the API layer where available
  api.getAllOccupancy().then((rows) => setOccupancy((rows as OccupancyRow[]).slice(0, 4)));
  api.getEvents().then((evts) => setEvents((evts as EventLite[]).slice(0, 4)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Regulator console</h1>
          <p className="mt-1 text-sm text-gray-600">Seed‑to‑sale oversight, compliance monitoring, and public safety</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label="Regulator view" />
          <Badge label="MVP demo" tone="neutral" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((k) => (
          <KPI key={k.label} label={k.label} value={k.value} icon={<div className="text-emerald-600">{k.icon}</div>} />
        ))}
      </div>

      {/* License overview + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="License overview" subtitle="Mix by type and status">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {licenseMix.map((lic) => (
              <div key={lic.type} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span className="font-medium text-gray-800">{lic.type}</span>
                  </div>
                  <span className="text-xs">{lic.active + lic.pending + lic.suspended + lic.expired} total</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <StatusStat label="Active" value={lic.active} tone="emerald" />
                  <StatusStat label="Pending" value={lic.pending} tone="amber" />
                  <StatusStat label="Susp." value={lic.suspended} tone="rose" />
                  <StatusStat label="Expired" value={lic.expired} tone="gray" />
                </div>
                <div className="mt-3">
                  <StackedBar
                    parts={[
                      { value: lic.active, tone: 'emerald' },
                      { value: lic.pending, tone: 'amber' },
                      { value: lic.suspended, tone: 'rose' },
                      { value: lic.expired, tone: 'gray' },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Quick actions">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <QuickLink icon={<Sparkles className="h-4 w-4" />} label="Licensing wizard" to="/wizard" />
            <QuickLink icon={<CalendarIcon className="h-4 w-4" />} label="Compliance calendar" to="/calendar" />
            <QuickLink icon={<FileBarChart2 className="h-4 w-4" />} label="Generate reports" to="/reports" />
            <QuickLink icon={<Workflow className="h-4 w-4" />} label="Trace lifecycle" to="/lifecycle" />
          </div>
        </Card>
      </div>

      {/* Pipeline + Compliance alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Production pipeline" subtitle="Plants, batches, and testing">
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
        <Card title="Compliance & alerts" subtitle="Exceptions requiring attention">
          <ul className="mt-1 space-y-2 text-sm text-gray-700">
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
          </ul>
        </Card>
      </div>

      {/* Utilization + Schedule + Movements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" title="Facility utilization" subtitle="Occupancy vs capacity (sample)">
          <div className="space-y-3">
            {occupancy.map((o) => (
              <div key={o.structureId} className="">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span className="text-gray-800">{o.facility} / {o.structure}</span>
                  </div>
                  <span>
                    {o.occupied}/{o.capacity}
                  </span>
                </div>
                <Progress value={o.occupied} max={o.capacity} />
              </div>
            ))}
            {occupancy.length === 0 && (
              <div className="text-xs text-gray-500">No occupancy data available.</div>
            )}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Inspections & schedule" subtitle="Next 4 items">
            <ul className="mt-1 space-y-2 text-sm text-gray-700">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <CalendarIcon className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden />
                  <span>
                    <span className="font-medium">{e.title}</span>
                    <span className="text-gray-500"> • {new Date(e.startDate).toLocaleDateString()}</span>
                  </span>
                </li>
              ))}
              {events.length === 0 && <li className="text-xs text-gray-500">No scheduled items.</li>}
            </ul>
          </Card>
          <Card title="Recent movements" subtitle="Transfers & deliveries">
            <ul className="mt-1 space-y-2 text-sm text-gray-700">
              {transfers.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span>{t.from} → {t.to}</span>
                  </div>
                  <span className="text-xs text-gray-500">{t.items} items • {t.status} • {t.ts}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
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
      <Waypoints className="h-4 w-4 text-gray-400" aria-hidden />
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
