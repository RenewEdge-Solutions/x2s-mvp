import React from 'react';
import Card from '../components/Card';
import { FileText, Download, Plus } from 'lucide-react';

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
    title: 'Licensing & Permits',
    items: [
      { key: 'licensing_register', label: 'Licensee Register', description: 'All active, suspended, expired licensees by class', format: 'csv' },
      { key: 'applications_sla', label: 'Applications & SLA', description: 'Queue, status, background checks, SLA deadlines', format: 'csv' },
      { key: 'license_status_summary', label: 'License Status Summary', description: 'Active, suspended, expired by category', format: 'pdf' },
    ],
  },
  {
    title: 'Compliance & Inspections',
    items: [
      { key: 'inspections_schedule', label: 'Inspections Schedule', description: 'Upcoming and completed inspections', format: 'csv' },
      { key: 'inspections_outcomes', label: 'Inspection Outcomes', description: 'Findings, non-conformities, CAPA', format: 'pdf' },
      { key: 'compliance_alerts_summary', label: 'Compliance Alerts Summary', description: 'Critical, major, minor alerts', format: 'csv' },
    ],
  },
  {
    title: 'Enforcement & Sanctions',
    items: [
      { key: 'enforcement_cases', label: 'Enforcement Cases', description: 'Open/closed cases, status, assignments', format: 'csv' },
      { key: 'sanctions_summary', label: 'Sanctions Summary', description: 'Fines, suspensions, license actions', format: 'pdf' },
    ],
  },
  {
    title: 'Market, Production & Sales',
    items: [
      { key: 'market_production', label: 'Production Summary', description: 'Plantings, harvests, destruction', format: 'csv' },
      { key: 'market_sales', label: 'Sales Summary', description: 'Wholesale and retail volumes/values', format: 'csv' },
    ],
  },
  {
    title: 'Lab & Public Health',
    items: [
      { key: 'lab_coa_passfail', label: 'Lab COA Pass/Fail', description: 'Results by product category', format: 'csv' },
      { key: 'lab_turnaround', label: 'Lab Turnaround Time', description: 'Average TAT and outliers', format: 'pdf' },
      { key: 'recalls_log', label: 'Recalls Log', description: 'Active and historical recalls', format: 'pdf' },
    ],
  },
  {
    title: 'Import/Export & Logistics',
    items: [
      { key: 'import_export_permits', label: 'Import/Export Permits', description: 'Issued permits and validity', format: 'csv' },
      { key: 'import_export_movements', label: 'Cross-border Movements', description: 'Shipments and outcomes', format: 'csv' },
    ],
  },
  {
    title: 'Geographic & Finance',
    items: [
      { key: 'geographic_licensees', label: 'Licensees by District', description: 'Distribution by geography', format: 'pdf' },
      { key: 'revenue_fees', label: 'Revenue & Fees', description: 'Licensing revenue and renewals', format: 'csv' },
      { key: 'blockchain_integrity', label: 'Blockchain Integrity Summary', description: 'Tx volume, anomalies, last block', format: 'pdf' },
    ],
  },
];

export default function Reports() {
  const savedSnapshots = [
    { id: 'snap-1003', type: 'compliance_alerts_summary', createdAt: new Date(Date.now() - 3600_000 * 6).toISOString() },
    { id: 'snap-1002', type: 'license_status_summary', createdAt: new Date(Date.now() - 3600_000 * 24).toISOString() },
    { id: 'snap-1001', type: 'market_production', createdAt: new Date(Date.now() - 3600_000 * 48).toISOString() },
  ];

  const handleDownload = (key: string) => {
    alert(`MVP: Generating and downloading report: ${key}`);
  };

  const handleCreateSnapshot = (key: string) => {
    alert(`MVP: Created report snapshot for: ${key}`);
  };

  return (
    <div className="space-y-6">
      {/* Automated (on-demand) reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportGroups.map((group) => (
          <Card key={group.title} title={group.title} subtitle="Bill-aligned regulatory reporting (MVP)">
            <ul className="divide-y divide-gray-100">
              {group.items.map((t) => (
                <li key={t.key} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" aria-hidden />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.description} • {t.format.toUpperCase()}</div>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                    onClick={() => handleDownload(t.key)}
                  >
                    <Download className="h-4 w-4" aria-hidden /> Download
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Create (snapshot) */}
      <Card title="Create a report snapshot" subtitle="Persist a point-in-time copy (mock)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportGroups.flatMap((g) => g.items).map((t) => (
            <button
              key={t.key}
              onClick={() => handleCreateSnapshot(t.key)}
              className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-gray-800"><Plus className="h-4 w-4" aria-hidden /> {t.label}</span>
              <span className="text-xs text-gray-500">{t.format.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Saved snapshots (mock) */}
      <Card title="Saved Snapshots" subtitle="Previously created snapshots (MVP)">
        {savedSnapshots.length === 0 ? (
          <div className="text-sm text-gray-600">No snapshots yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {savedSnapshots.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium">{labelOf(r.type)}</div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <button className="inline-flex items-center gap-1 text-primary hover:underline text-sm" onClick={() => handleDownload(r.type)}>
                  <Download className="h-4 w-4" aria-hidden /> Download
                </button>
              </li>
            ))}
          </ul>
        )}
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
