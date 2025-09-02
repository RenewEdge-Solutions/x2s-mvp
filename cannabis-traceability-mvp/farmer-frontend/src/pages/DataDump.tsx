import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';

export default function DataDump() {
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pl, hv] = await Promise.all([api.getPlants(), api.getHarvests()]);
        setPlants(pl);
        setHarvests(hv);
      } catch (e: any) {
        setError(e?.message || 'Failed to load mock data');
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Debug Data</h1>
      {error && <div className="rounded-md bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}
      <Card title={`Plants (${plants.length})`}>
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(plants, null, 2)}</pre>
      </Card>
      <Card title={`Harvests (${harvests.length})`}>
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(harvests, null, 2)}</pre>
      </Card>
    </div>
  );
}
