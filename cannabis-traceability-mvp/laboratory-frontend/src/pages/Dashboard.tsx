import React, { useEffect, useState } from 'react';
import { FileBarChart2, Calendar as CalendarIcon, Waypoints, ClipboardList, AlertTriangle, Beaker, Activity, PackageCheck } from 'lucide-react';
import Card from '../components/Card';
import KPI from '../components/KPI';
import { Link } from 'react-router-dom';
// Lab dashboard is self-contained; no external events loaded in MVP

export default function Dashboard() {
  // Static demo metrics (mock-first, no backend required)
  const kpis = [
    { label: 'Samples in queue', value: 37, icon: <ClipboardList className="h-5 w-5" aria-hidden />, to: '/testing' },
    { label: 'Avg TAT (days)', value: 4.2, icon: <Activity className="h-5 w-5" aria-hidden />, to: '/reports' },
    { label: 'COA awaiting sign-off', value: 5, icon: <PackageCheck className="h-5 w-5" aria-hidden />, to: '/testing' },
    { label: 'Batches awaiting COA', value: 11, icon: <ClipboardList className="h-5 w-5" aria-hidden />, to: '/testing' },
    { label: 'Alerts', value: 2, icon: <AlertTriangle className="h-5 w-5" aria-hidden />, to: '/testing' },
    { label: 'Pass rate', value: '93%', icon: <Beaker className="h-5 w-5" aria-hidden />, to: '/reports' },
  ];

  // License mix by type (mocked)
  const panels = [
    { name: 'Potency', done: 18, pending: 6, failed: 0 },
    { name: 'Pesticides', done: 14, pending: 3, failed: 1 },
    { name: 'Microbials', done: 12, pending: 2, failed: 0 },
    { name: 'Heavy metals', done: 9, pending: 1, failed: 0 },
  ];

  // Pipeline snapshot (mocked)
  const pipeline = {
    submissions: { intakeToday: 12, inTesting: 29, awaitingReview: 7 },
    batches: { awaitingCoa: 11, failed7d: 1, released: 42 },
  };

  // Recent movements removed per request (card removed)

  // Alerts (mocked)
  type EventLite = { id: number; title: string; eventType: string; startDate: string };
  const [events, setEvents] = useState<EventLite[]>([]);

  // Featured inspection/schedule items (mocked, merged before API events)
  function daysFromNow(n: number) {
    const d = new Date(Date.now() + n * 86400000);
    return d.toISOString();
  }
  const featuredEvents: EventLite[] = [
    { id: -1, title: 'COA Due: Batch B-24-011', eventType: 'deadline', startDate: daysFromNow(2) },
    { id: -2, title: 'Instrument calibration: HPLC', eventType: 'maintenance', startDate: daysFromNow(3) },
    { id: -3, title: 'Sample pickup: Green Fields Co.', eventType: 'logistics', startDate: daysFromNow(3) },
    { id: -4, title: 'Client review: Island Wellness', eventType: 'meeting', startDate: daysFromNow(4) },
    { id: -5, title: 'Proficiency test submission', eventType: 'deadline', startDate: daysFromNow(7) },
  ];
  const visibleEvents = [...featuredEvents, ...events];

  const turnaroundSamples = [
    { id: 'B-24-011', name: 'Green Fields Co.', panel: 'Potency', days: 2 },
    { id: 'B-24-009', name: 'North Shore Labs', panel: 'Pesticides', days: 4 },
    { id: 'B-24-008', name: 'Island Wellness', panel: 'Microbials', days: 3 },
  ];

  return (
  <div className="space-y-4">
  {/* Title intentionally removed for a cleaner overview per request */}

      {/* KPIs */}
  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <KPI key={k.label} label={k.label} value={k.value} icon={<div className="text-emerald-600">{k.icon}</div>} to={k.to} />
        ))}
      </div>

      {/* Panels overview */}
      <div className="grid grid-cols-1 gap-4">
        <Card title="Testing panels overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {panels.map((p) => (
              <div key={p.name} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <Link to="/testing" className="inline-flex items-center gap-2 hover:text-gray-900">
                    <Beaker className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span className="font-medium text-gray-800 underline decoration-transparent hover:decoration-gray-300">{p.name}</span>
                  </Link>
                  <span className="text-xs">{p.done + p.pending} total</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <StatusStat label="Done" value={p.done} tone="emerald" />
                  <StatusStat label="Pending" value={p.pending} tone="amber" />
                  <StatusStat label="Failed" value={p.failed} tone="rose" />
                </div>
                <div className="mt-3">
                  <StackedBar
                    parts={[
                      { value: p.done, tone: 'emerald' },
                      { value: p.pending, tone: 'amber' },
                      { value: p.failed, tone: 'rose' },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pipeline + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card className="lg:col-span-2" title="Lab pipeline" to="/testing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-700">Submissions</h4>
              <div className="mt-2 space-y-2">
                <Bar label="Intake today" value={pipeline.submissions.intakeToday} max={50} tone="emerald" />
                <Bar label="In testing" value={pipeline.submissions.inTesting} max={60} tone="amber" />
                <Bar label="Awaiting review" value={pipeline.submissions.awaitingReview} max={30} tone="sky" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700">Batches</h4>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <MiniStat icon={<ClipboardList className="h-4 w-4" />} label="Awaiting COA" value={pipeline.batches.awaitingCoa} />
                <MiniStat icon={<Beaker className="h-4 w-4" />} label="Failed (7d)" value={pipeline.batches.failed7d} tone="rose" />
                <MiniStat icon={<Activity className="h-4 w-4" />} label="Released" value={pipeline.batches.released} tone="emerald" />
              </div>
            </div>
          </div>
        </Card>
  <Card title="Alerts" to="/testing">
          <div className="mt-1 max-h-[160px] overflow-auto pr-1">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden />
                <span>3 batches nearing COA deadline</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" aria-hidden />
                <span>1 batch failed pesticide limits in last 7 days</span>
              </li>
              <li className="flex items-start gap-2">
                <Beaker className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden />
                <span>0 instrument calibration issues</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

  {/* Facility utilization card removed per request */}

      {/* Three-up row: Schedule, Turnaround, COA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  <Card title="Turnaround samples" to="/testing">
          <div className="mt-1 max-h-[160px] overflow-auto pr-1">
            <ul className="space-y-2 text-sm text-gray-700">
              {turnaroundSamples.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <Beaker className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span className="font-medium text-gray-900">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.panel}</span>
                  </div>
                  <span className={`text-xs font-medium ${s.days >= 5 ? 'text-rose-700' : s.days >= 3 ? 'text-amber-700' : 'text-gray-500'}`}>{s.days}d</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
  <Card title="COA status" to="/testing">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={<PackageCheck className="h-4 w-4" />} label="Ready" value={5} tone="emerald" />
            <MiniStat icon={<Beaker className="h-4 w-4" />} label="In review" value={7} />
            <MiniStat icon={<AlertTriangle className="h-4 w-4" />} label="Failed" value={1} tone="rose" />
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
