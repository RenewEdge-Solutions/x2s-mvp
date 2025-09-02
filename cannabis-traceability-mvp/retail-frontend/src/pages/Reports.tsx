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
    title: 'Sales & Finance',
    items: [
      { key: 'daily_z_report', label: 'Daily Z-Report', description: 'End-of-day totals: gross, tax, tenders, voids/returns', format: 'pdf' },
      { key: 'sales_tax_summary', label: 'Sales Tax Summary', description: 'Tax collected by rate and period', format: 'csv' },
      { key: 'sales_by_category', label: 'Sales by Category', description: 'Category mix (Flower, Pre-roll, Edibles, Oils, etc.)', format: 'csv' },
      { key: 'cash_drawer_recon', label: 'Cash Drawer Reconciliation', description: 'Open/close counts, over/shorts, adjustments', format: 'pdf' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { key: 'inventory_on_hand', label: 'Inventory on Hand', description: 'On-hand by SKU with THC/CBD, cost, and retail price', format: 'csv' },
      { key: 'low_stock_reorder', label: 'Low Stock & Reorder', description: 'Below threshold items and recommended reorder qty', format: 'csv' },
      { key: 'shrinkage_adjustments', label: 'Shrinkage & Adjustments', description: 'Breakage, samples, recount adjustments log', format: 'csv' },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { key: 'age_verification_log', label: 'Age Verification Log', description: 'ID checks and failures (no PII)', format: 'csv' },
      { key: 'purchase_limits', label: 'Patient Purchase Limits', description: 'Sales vs. limits (adult-use vs. medical)', format: 'csv' },
      { key: 'chain_of_custody_retail', label: 'Chain-of-Custody (Retail)', description: 'Receipts, transfers, and returns log', format: 'pdf' },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      { key: 'deliveries_schedule', label: 'Deliveries Schedule', description: 'Incoming/outgoing manifests and ETAs', format: 'csv' },
      { key: 'staff_shifts', label: 'Staff Shifts', description: 'Shifts, absenteeism, and coverage', format: 'csv' },
    ],
  },
];

export default function Reports() {
  const [creating, setCreating] = useState<string | null>(null);
  const savedSnapshots = [
    { id: 'snap-2003', type: 'daily_z_report', createdAt: new Date(Date.now() - 3600_000 * 6).toISOString() },
    { id: 'snap-2002', type: 'inventory_on_hand', createdAt: new Date(Date.now() - 3600_000 * 24).toISOString() },
    { id: 'snap-2001', type: 'sales_tax_summary', createdAt: new Date(Date.now() - 3600_000 * 48).toISOString() },
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" aria-hidden /> Reports
        </h1>
      </div>
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
