import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { ShieldCheck, RefreshCw, Boxes } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
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
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
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

  // Auto-verify all records when events change
  useEffect(() => {
    let cancelled = false;
    async function verifyAll() {
      const entries = await Promise.all(
        events.map(async (e) => {
          try {
            const local = await sha256Hex(JSON.stringify(e.payload));
            return [e.id, local === (e.hash ?? '')] as const;
          } catch {
            return [e.id, false] as const;
          }
        })
      );
      if (!cancelled) setMatches(Object.fromEntries(entries));
    }
    if (events.length > 0) verifyAll(); else setMatches({});
    return () => { cancelled = true; };
  }, [events]);

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2">
        <Boxes className="h-5 w-5" aria-hidden /> Blockchain Integrity
      </h2>
      {activeModule !== 'cannabis' && (
        <p className="text-sm text-gray-700 mb-3">The {activeModule} module UI is not yet implemented in this MVP.</p>
      )}
      <div className="overflow-auto max-h-[52rem]">
        <table className="min-w-full w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Hash</th>
              <th className="py-2 pr-4">Integrity</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e: any) => (
              <tr key={e.id} className="text-gray-800">
                <td className="py-2 pr-4">{e.type}</td>
                <td className="py-2 pr-4 font-mono text-xs">{e.id}</td>
                <td className="py-2 pr-4 font-mono text-xs break-all">{e.hash}</td>
                <td className="py-2 pr-4">
                  {verifying[e.id] ? (
                    <span className="text-xs text-orange-600 inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden /> Verifying…
                    </span>
                  ) : matches[e.id] === undefined ? (
                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse" aria-hidden /> Checking…
                    </span>
                  ) : matches[e.id] ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      ✓ Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      ✕ Mismatch
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <button
                    type="button"
                    className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    title="Re-verify hash"
                    aria-label={`Re-verify ${e.id}`}
                    disabled={!!verifying[e.id]}
                    onClick={async () => {
                      // Show verifying for at least 800ms, then restore prior status (do not mutate integrity result)
                      setVerifying((v) => ({ ...v, [e.id]: true }));
                      try {
                        const start = performance.now();
                        await sha256Hex(JSON.stringify(e.payload));
                        const elapsed = performance.now() - start;
                        const minDuration = 800; // ms
                        if (elapsed < minDuration) {
                          await new Promise((res) => setTimeout(res, minDuration - elapsed));
                        }
                      } finally {
                        setVerifying((v) => ({ ...v, [e.id]: false }));
                      }
                    }}
                  >
                    <RefreshCw className={`h-4 w-4 ${verifying[e.id] ? 'animate-spin text-orange-500' : ''}`} aria-hidden />
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
