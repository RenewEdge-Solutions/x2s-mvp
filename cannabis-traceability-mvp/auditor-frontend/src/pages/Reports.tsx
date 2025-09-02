import React, { useState } from 'react';
import Card from '../components/Card';
import { FileText, Download, Plus, Loader2 } from 'lucide-react';

type ReportItem = {
  key: string;
  label: string;
  description: string;
  format: 'csv' | 'pdf';
};

type ReportGroup = {
  title: string;
  items: ReportItem[];
};

const reportGroups: ReportGroup[] = [
  {
    title: 'Compliance Inspections',
    items: [
      { key: 'inspection_schedule', label: 'Inspection Schedule', description: 'Upcoming and completed inspections by facility', format: 'csv' },
      { key: 'inspection_findings', label: 'Inspection Findings & CAPA', description: 'Non-conformities and corrective actions', format: 'pdf' },
      { key: 'followup_tracking', label: 'Follow-up Tracking', description: 'Due dates, closures, escalations', format: 'csv' },
    ],
  },
  {
    title: 'Enforcement Actions',
    items: [
      { key: 'cases_register', label: 'Cases Register', description: 'Open/closed cases with status and assignments', format: 'csv' },
      { key: 'sanctions', label: 'Sanctions & Penalties', description: 'Fines, suspensions, licence actions', format: 'pdf' },
    ],
  },
  {
    title: 'Production & Market Activity',
    items: [
      { key: 'cultivation_activity', label: 'Cultivation Activity', description: 'Plantings, harvests, destruction by month', format: 'csv' },
      { key: 'market_sales_summary', label: 'Market Sales Summary', description: 'Wholesale and retail volumes/values', format: 'csv' },
    ],
  },
  {
    title: 'Laboratory & Public Health',
    items: [
      { key: 'coa_pass_rate', label: 'COA Pass Rate by Product', description: 'Pass/fail counts by product category', format: 'csv' },
      { key: 'lab_tat', label: 'Laboratory Turnaround Time', description: 'Median and outlier TAT for submissions', format: 'pdf' },
      { key: 'recalls', label: 'Product Recalls', description: 'Active and historical recall notices', format: 'pdf' },
    ],
  },
  {
    title: 'Permits & Cross‑Border',
    items: [
      { key: 'permits_register', label: 'Import/Export Permits Register', description: 'Issued permits, validity, purpose', format: 'csv' },
      { key: 'cross_border_movements', label: 'Cross‑border Movements', description: 'Shipments, route, and outcomes', format: 'csv' },
    ],
  },
  {
  title: 'Geography & Integrity',
    items: [
      { key: 'licensees_by_district', label: 'Licensees by District', description: 'Distribution by geography', format: 'pdf' },
      { key: 'ledger_integrity', label: 'Ledger Integrity Summary', description: 'On‑chain records overview', format: 'pdf' },
    ],
  },
];

export default function Reports() {
  const [creating, setCreating] = useState<string | null>(null);
  const savedSnapshots = [
    { id: 'snap-1003', type: 'compliance_alerts_summary', createdAt: new Date(Date.now() - 3600_000 * 6).toISOString() },
    { id: 'snap-1002', type: 'license_status_summary', createdAt: new Date(Date.now() - 3600_000 * 24).toISOString() },
    { id: 'snap-1001', type: 'market_production', createdAt: new Date(Date.now() - 3600_000 * 48).toISOString() },
  ];

  const handleDownload = (key: string, format: 'csv' | 'pdf') => {
    const ext = format.toLowerCase();
    const filename = `${key}.${ext}`;
    const mime = ext === 'pdf' ? 'application/pdf' : 'text/csv';
    const blob = new Blob([''], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateSnapshot = (key: string, format: 'csv' | 'pdf') => {
    // Simulate processing time before download
    setCreating(key);
    window.setTimeout(() => {
      const ext = format.toLowerCase();
      const filename = `${key}.${ext}`;
      const mime = ext === 'pdf' ? 'application/pdf' : 'text/csv';
      const blob = new Blob([''], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCreating(null);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Create (snapshot) */}
  <Card title="Create a report snapshot">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {reportGroups.flatMap((g) => g.items).map((t) => (
            <button
              key={t.key}
        onClick={() => handleCreateSnapshot(t.key, t.format)}
              className="w-full inline-flex items-center justify-between px-2 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-60"
              disabled={creating === t.key}
              title={`${t.label}`}
            >
              <span className="flex items-center gap-2 text-gray-800">
                {creating === t.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                {creating === t.key ? 'Processing…' : t.label}
              </span>
              <span className="text-[11px] text-gray-500">{t.format.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Consolidated reports with dropdowns */}
  <Card title="Automated Reports">
        <div className="space-y-3">
          {reportGroups.map((group) => (
            <details key={group.title} className="rounded-md border border-gray-200">
              <summary className="cursor-pointer select-none px-3 py-2 font-medium text-gray-900 flex items-center justify-between">
                <span>{group.title}</span>
                <span className="text-xs text-gray-500">{group.items.length} items</span>
              </summary>
              <ul className="divide-y divide-gray-100">
                {group.items.map((t) => (
                  <li key={t.key} className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" aria-hidden />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t.label}</div>
                        <div className="text-xs text-gray-500">{t.description} • {t.format.toUpperCase()}</div>
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm hover:bg-gray-50"
                      onClick={() => handleDownload(t.key, t.format)}
                    >
                      <Download className="h-4 w-4" aria-hidden /> Download
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}

          <details className="rounded-md border border-gray-200">
            <summary className="cursor-pointer select-none px-3 py-2 font-medium text-gray-900 flex items-center justify-between">
              <span>Saved Snapshots</span>
              <span className="text-xs text-gray-500">{savedSnapshots.length}</span>
            </summary>
            {savedSnapshots.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-600">No snapshots yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {savedSnapshots.map((r) => (
                  <li key={r.id} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-900 font-medium">{labelOf(r.type)}</div>
                      <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <button className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm hover:bg-gray-50" onClick={() => handleDownload(r.type, 'csv')}>
                      <Download className="h-4 w-4" aria-hidden /> Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </div>
      </Card>
    </div>
  );
}

function labelOf(key: string) {
  const map: Record<string, string> = Object.fromEntries(
    reportGroups.flatMap((g) => g.items.map((i) => [i.key, i.label]))
  );
  return map[key] ?? key;
}
