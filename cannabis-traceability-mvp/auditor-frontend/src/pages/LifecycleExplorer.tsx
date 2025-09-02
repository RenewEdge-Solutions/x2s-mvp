import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { History as HistoryIcon, FileText, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';

export default function LifecycleExplorer() {
  type Ev = any;
  const [events, setEvents] = useState<Ev[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [batchFilter, setBatchFilter] = useState<string | 'all'>('all');
  const [respFilter, setRespFilter] = useState<string | 'all'>('all');
  const [originFilter, setOriginFilter] = useState<string | 'all'>('all');
  // Auditor: only operator events
  const { activeModule } = useModule();
  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getLifecycle().then((ops) => {
        const onlyOps = (ops || []).filter((e: any) => getCategory(e) === 'operator');
        onlyOps.sort((a: any, b: any) => {
          const ta = getTimeKey(a);
          const tb = getTimeKey(b);
          return (tb || 0) - (ta || 0);
        });
        setEvents(onlyOps);
      });
    } else {
      setEvents([]);
    }
  }, [activeModule]);

  const types = useMemo(() => Array.from(new Set(events.map((e: any) => e.type))), [events]);
  const batches = useMemo(() => Array.from(new Set(events.map((e: any) => e.batchId).filter(Boolean))), [events]);
  const responsibles = useMemo(() => {
    return Array.from(new Set(events.map((e: any) => getResponsibleUsername(e)).filter((v) => v && v !== '—')));
  }, [events]);
  const origins = useMemo(() => {
    return Array.from(new Set(events.map((e: any) => getOrigin(e)).filter((v) => v && v !== '—')));
  }, [events]);

  const filtered = events.filter((e: any) => {
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesBatch = batchFilter === 'all' || e.batchId === batchFilter;
    const responsible = getResponsibleUsername(e);
    const matchesResp = respFilter === 'all' || responsible === respFilter;
    const origin = getOrigin(e);
    const matchesOrigin = originFilter === 'all' || origin === originFilter;
  // Auditor: category filter removed, only operator events loaded
  return matchesType && matchesBatch && matchesResp && matchesOrigin;
  });

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2">
        <HistoryIcon className="h-5 w-5" aria-hidden /> Event History
      </h2>
      {activeModule !== 'cannabis' && (
        <p className="text-sm text-gray-700 mb-3">The {activeModule} module UI is not yet implemented in this MVP.</p>
      )}
  {/* Filters moved to header row */}
      <div className="overflow-auto max-h-[64rem] rounded-lg border border-gray-100">
        <table className="min-w-full w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 bg-gray-50">
              <th className="py-2 pr-4 font-semibold">Category</th>
              <th className="py-2 pr-4 font-semibold">Event</th>
              <th className="py-2 pr-4 font-semibold">Origin</th>
              <th className="py-2 pr-4 font-semibold">User</th>
              <th className="py-2 pr-4 font-semibold">When</th>
              <th className="py-2 pr-4 font-semibold">Batch</th>
            </tr>
      <tr className="bg-white border-b border-gray-100 text-xs">
              <th className="py-1 pr-4">
                <div className="text-xs text-gray-500">Operator</div>
              </th>
              <th className="py-1 pr-4">
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                  <option value="all">All types</option>
                  {types.map((t)=> (<option key={t} value={t}>{String(t).replace(/-/g,' ')}</option>))}
                </select>
              </th>
              <th className="py-1 pr-4">
                <select value={originFilter} onChange={e=>setOriginFilter(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                  <option value="all">All</option>
                  {origins.map((o)=>(<option key={o} value={o}>{o}</option>))}
                </select>
              </th>
              <th className="py-1 pr-4">
        <select value={respFilter} onChange={e=>setRespFilter(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                  <option value="all">All</option>
                  {responsibles.map((r)=>(<option key={r} value={r}>{r}</option>))}
                </select>
              </th>
              <th className="py-1 pr-4"></th>
              <th className="py-1 pr-4">
                <div className="flex gap-1">
                  <select value={batchFilter} onChange={e=>setBatchFilter(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                    <option value="all">All</option>
                    {batches.map((b)=>(<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-gray-500">No records match the current filters.</td>
              </tr>
            ) : (
              filtered.map((e: any, i) => (
                <tr key={i} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {renderCategoryPill(e)}
                  </td>
                  <td className="py-2 pr-4 text-gray-900 font-medium">
                    {prettyType(e.type)}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 text-xs text-gray-700">{getOrigin(e)}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 text-xs text-gray-700">{getResponsibleUsername(e)}</span>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap text-xs text-gray-600">{formatWhen(e)}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-0.5 font-mono text-xs text-gray-700">{e.batchId || '-'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function formatWhen(e: any) {
  const key = e.receivedAt || e.startedAt || e.at || e.harvestedAt || e.startedAt || e.submittedAt || e.issuedAt || e.packagedAt || e.transferredAt || e.renewedAt || e.amendedAt || e.suspendedAt || e.reinstatedAt;
  return key ? new Date(key).toLocaleString() : '';
}

function getResponsibleUsername(e: any): string {
  const raw = getResponsible(e) || '';
  // If it already looks like a username (has digits or underscores), keep it
  if (/[_\d]/.test(raw)) return raw;
  // Convert phrases to snake_case usernames
  const base = raw
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, '') // remove parenthetical role hints
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'user';
  // Add a short discriminator if it's a generic role-based default
  if (/(applicant|licensing|finance|operator)/.test(base)) {
    const discr = (e.licenceId?.toString().replace(/[^a-z0-9]/gi, '').slice(-4)) || (e.batchId?.toString().slice(-4)) || (getTimeKey(e)?.toString().slice(-4)) || '0000';
    return `${base}_${discr}`;
  }
  return base;
}

function getResponsible(e: any): string {
  const cat = getCategory(e);
  if (cat === 'licensing') {
    switch (e.type) {
      case 'application-submitted':
        return 'Applicant User';
      case 'fee-payment':
        return 'Finance Officer';
      case 'license-issued':
      case 'license-renewed':
      case 'license-amended':
      case 'license-suspended':
      case 'license-reinstated':
        return 'Licensing Officer';
      default:
        return 'Licensing Officer';
    }
  }
  // Operator events: prefer explicit actors, then role-based fallback
  return (
    e.by ||
    e.trimmedBy ||
    e.submittedBy ||
    e.packagedBy ||
    e.transferredBy ||
    e.inspector ||
    (e.lab ? `${e.lab} (Lab)` : null) ||
    (e.supplier ? `${e.supplier} (Supplier)` : null) ||
    'Operator User'
  );
}

function getOrigin(e: any): string {
  switch (e.type) {
    // Licensing
    case 'application-submitted':
      return 'Applicant Portal';
    case 'license-issued':
    case 'license-renewed':
    case 'license-amended':
    case 'license-suspended':
    case 'license-reinstated':
      return 'Licensing Authority';
    case 'fee-payment':
      return 'Finance Department';
    case 'seed-received':
      return e.supplier ? `Supplier: ${e.supplier}` : 'Supplier';
    case 'germination':
      return 'Nursery / Farm facility';
    case 'transplant':
      return e.to ? `Farm: ${e.to}` : e.from ? `Farm: ${e.from}` : 'Farm facility';
    case 'flip-to-flower':
      return 'Farm facility';
    case 'harvest':
      return 'Farm facility';
    case 'drying':
      return e.location ? `Processing: ${e.location}` : 'Processing';
    case 'lab-submission':
    case 'coa-issued':
      return e.lab ? `Lab: ${e.lab}` : 'Lab';
    case 'packaged':
      return 'Processing';
    case 'transfer': {
      const to = e.to as string | undefined;
      if (to?.toLowerCase().includes('retail')) return `Retail: ${to}`;
      if (to?.toLowerCase().includes('pharmacy')) return `Pharmacy: ${to}`;
      return to ? `Distribution: ${to}` : 'Distribution';
    }
    default:
      return '—';
  }
}

function getWhat(e: any): string {
  switch (e.type) {
    // Licensing
    case 'application-submitted':
      return `Application submitted for ${e.licenceId} (${e.holder ?? '—'})`;
    case 'license-issued':
      return `License issued: ${e.licenceId} (${e.holder ?? '—'})`;
    case 'license-renewed':
      return `License renewed: ${e.licenceId} until ${e.until ?? ''}`;
    case 'license-amended':
      return `License amended: ${e.licenceId} (${(e.fields || []).join(', ')})`;
    case 'license-suspended':
      return `License suspended: ${e.licenceId}`;
    case 'license-reinstated':
      return `License reinstated: ${e.licenceId}`;
    case 'fee-payment':
      return `Fee payment: ${e.amount ?? ''} ${e.currency ?? ''} for ${e.licenceId ?? ''}`;
    case 'seed-received':
      return `Seeds received: lot ${e.lot}, qty ${e.quantity}, supplier ${e.supplier}`;
    case 'germination':
      return `Germination started (${e.method})`;
    case 'transplant':
      return `Transplanted ${e.count} plants: ${e.from} → ${e.to}`;
    case 'flip-to-flower':
      return 'Flip to flower initiated';
    case 'harvest':
      return `Harvested, wet weight ${e.wetWeightKg} kg`;
    case 'drying':
      return `Drying started at ${e.location}, target ${e.targetDays} days`;
    case 'lab-submission':
      return `Submitted to lab (${e.lab}): ${(e.tests || []).join(', ')}`;
    case 'coa-issued':
      return `COA issued by ${e.lab}: ${String(e.result || '').toUpperCase()} (THC ${e.thcPct}%, CBD ${e.cbdPct}%)`;
    case 'packaged':
      return `Packaged SKU ${e.sku}, units ${e.units}`;
    case 'transfer':
      return `Transferred to ${e.to}, manifest ${e.manifestId}`;
    default:
      return String(e.type).replace(/-/g, ' ');
  }
}

function getTimeKey(e: any): number | null {
  const k = e.receivedAt || e.startedAt || e.at || e.harvestedAt || e.submittedAt || e.issuedAt || e.packagedAt || e.transferredAt || e.renewedAt || e.amendedAt || e.suspendedAt || e.reinstatedAt;
  return k ? new Date(k).getTime() : null;
}

function getLicenceId(e: any): string | null {
  return e.licenceId || null;
}

function getCategory(e: any): 'licensing' | 'operator' {
  const t = String(e.type || '').toLowerCase();
  if (t.includes('licen') || t.includes('license') || t.includes('licence') || t.includes('application')) return 'licensing';
  return 'operator';
}

function prettyType(type: any): string {
  return String(type || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderCategoryPill(e: any) {
  // Auditor: Always show Operator category
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 text-emerald-700 bg-emerald-50 ring-emerald-200">
      <Building2 className="h-3.5 w-3.5" aria-hidden /> Operator
    </span>
  );
}
