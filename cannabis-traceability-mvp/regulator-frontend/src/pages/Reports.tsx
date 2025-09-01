import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { FileText, Download, Plus } from 'lucide-react';
import { api } from '../lib/api';

type ReportType = 'inventory_summary' | 'harvest_yields';

export default function Reports() {
  const [types, setTypes] = useState<Array<{ key: ReportType; label: string; description: string; format: 'csv' }>>([]);
  const [created, setCreated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const [t, c] = await Promise.all([api.getReportTypes(), api.listReports()]);
    setTypes(t);
    setCreated(c);
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (type: ReportType) => {
    setLoading(true);
    try {
      await api.createReport(type);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Automated reports" subtitle="Generated on demand; always up to date">
        <ul className="divide-y divide-gray-100">
          {types.map((t) => (
            <li key={t.key} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" aria-hidden />
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.description} • {t.format.toUpperCase()}</div>
                </div>
              </div>
              <a
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                href={api.autoReportUrl(t.key)}
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Create a report" subtitle="Persist a snapshot you can reference later">
        <div className="space-y-3">
          {types.map((t) => (
            <button
              key={t.key}
              disabled={loading}
              onClick={() => create(t.key)}
              className="w-full inline-flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3 text-gray-800"><Plus className="h-4 w-4" aria-hidden /> {t.label}</span>
              <span className="text-xs text-gray-500">{t.format.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Created reports" subtitle="Previously generated files">
        {created.length === 0 ? (
          <div className="text-sm text-gray-600">No reports yet. Use "Create a report" to add one.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {created.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium">{labelOf(r.type)}</div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <a className="inline-flex items-center gap-1 text-primary hover:underline text-sm" href={api.downloadReportUrl(r.id)}>
                  <Download className="h-4 w-4" aria-hidden /> Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function labelOf(key: ReportType) {
  switch (key) {
    case 'inventory_summary':
      return 'Inventory Summary';
    case 'harvest_yields':
      return 'Harvest Yields';
    default:
      return key;
  }
}
