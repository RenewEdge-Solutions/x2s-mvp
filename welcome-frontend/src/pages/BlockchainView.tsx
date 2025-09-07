import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
import AlcoholBlockchain from './AlcoholBlockchain';
import MushroomsBlockchain from './MushroomsBlockchain';
import ExplosivesBlockchain from './ExplosivesBlockchain';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function BlockchainView() {
  const [events, setEvents] = useState<any[]>([]);
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  const { activeModule } = useModule();
  const { user } = useAuth();

  // Route-level guard: restrict Integrity for operational roles
  if (user && (user.role === 'Operator' || user.role === 'Grower' || user.role === 'Shop' || user.role === 'Lab')) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getIntegrity().then(setEvents);
    } else {
      setEvents([]);
      setMatches({});
    }
  }, [activeModule]);

  const recompute = async (payload: any, id: string) => {
    const local = await sha256Hex(JSON.stringify(payload));
    setMatches((m) => ({ ...m, [id]: local === (events.find((e) => e.id === id)?.hash ?? '') }));
  };

  if (activeModule === 'alcohol') {
    return <AlcoholBlockchain />;
  }
  if (activeModule === 'mushrooms') {
    return <MushroomsBlockchain />;
  }
  if (activeModule === 'explosives') {
    return <ExplosivesBlockchain />;
  }

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" aria-hidden /> Blockchain Integrity
      </h2>
      {activeModule !== 'cannabis' && (
        <p className="text-sm text-gray-700 mb-3">The {activeModule} module UI is not yet implemented in this MVP.</p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Hash</th>
              <th className="py-2 pr-4">Verify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e: any) => (
              <tr key={e.id} className="text-gray-800">
                <td className="py-2 pr-4">{e.type}</td>
                <td className="py-2 pr-4 font-mono text-xs">{e.id}</td>
                <td className="py-2 pr-4 font-mono text-xs break-all">{e.hash}</td>
                <td className="py-2 pr-4">
                  <button
                    className={`rounded-md px-3 py-1 text-sm border ${matches[e.id] ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-700'}`}
                    onClick={() => recompute(e.payload, e.id)}
                  >
                    {matches[e.id] ? '✓ Match' : 'Recompute'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
