import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';

type Plant = { id: string; strain: string; location: string; plantedAt: string; harvested?: boolean };
type Harvest = { id: string; plantId: string; yieldGrams: number; status: string; harvestedAt: string };
type Report = { id: string; type: string; createdAt: string };

export default function DataDump() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [lifecycle, setLifecycle] = useState<any[]>([]);
  const [integrity, setIntegrity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ps, hs, rs, lc, ig] = await Promise.all([
        api.getPlants().catch(() => []),
        api.getHarvests().catch(() => []),
        api.listReports().catch(() => []),
        api.getLifecycle().catch(() => []),
        api.getIntegrity().catch(() => []),
      ]);
  setPlants(Array.isArray(ps) ? (ps as Plant[]) : []);
  setHarvests(Array.isArray(hs) ? (hs as Harvest[]) : []);
  setReports(Array.isArray(rs) ? (rs as Report[]) : []);
  setLifecycle(Array.isArray(lc) ? (lc as any[]) : []);
  setIntegrity(Array.isArray(ig) ? (ig as any[]) : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const Section = ({ title, children, count }: { title: string; children: React.ReactNode; count: number }) => (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="text-sm text-gray-500">{count}</div>
      </div>
      {children}
    </Card>
  );

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800 break-words">{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">Data (App View)</h1>
        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            onClick={load}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <Card>
          <div className="text-sm text-rose-700">{error}</div>
        </Card>
      )}

      <Section title="Plants" count={plants.length}>
        {plants.length === 0 ? (
          <div className="text-sm text-gray-600">No plants.</div>
        ) : (
          <ul className="space-y-3">
            {plants.map((p) => (
              <li key={p.id} className="p-3 border rounded-md">
                <div className="grid gap-2">
                  <Row label="ID" value={<code className="text-xs">{p.id}</code>} />
                  <Row label="Strain" value={p.strain} />
                  <Row label="Location" value={p.location} />
                  <Row label="Planted" value={new Date(p.plantedAt).toLocaleString()} />
                  <Row label="Harvested" value={String(!!p.harvested)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Harvests" count={harvests.length}>
        {harvests.length === 0 ? (
          <div className="text-sm text-gray-600">No harvests.</div>
        ) : (
          <ul className="space-y-3">
            {harvests.map((h) => (
              <li key={h.id} className="p-3 border rounded-md">
                <div className="grid gap-2">
                  <Row label="ID" value={<code className="text-xs">{h.id}</code>} />
                  <Row label="Plant" value={<code className="text-xs">{h.plantId}</code>} />
                  <Row label="Weight" value={`${h.yieldGrams} g`} />
                  <Row label="Status" value={h.status} />
                  <Row label="Harvested" value={h.harvestedAt ? new Date(h.harvestedAt).toLocaleString() : '—'} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Reports" count={reports.length}>
        {reports.length === 0 ? (
          <div className="text-sm text-gray-600">No reports.</div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="p-3 border rounded-md">
                <div className="grid gap-2">
                  <Row label="ID" value={<code className="text-xs">{r.id}</code>} />
                  <Row label="Type" value={r.type} />
                  <Row label="Created" value={new Date(r.createdAt).toLocaleString()} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Lifecycle events" count={lifecycle.length}>
        {lifecycle.length === 0 ? (
          <div className="text-sm text-gray-600">No events.</div>
        ) : (
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-80">{JSON.stringify(lifecycle, null, 2)}</pre>
        )}
      </Section>

      <Section title="Integrity events" count={integrity.length}>
        {integrity.length === 0 ? (
          <div className="text-sm text-gray-600">No events.</div>
        ) : (
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-80">{JSON.stringify(integrity, null, 2)}</pre>
        )}
      </Section>
    </div>
  );
}
