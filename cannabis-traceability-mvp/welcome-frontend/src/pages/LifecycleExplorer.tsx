import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { History as HistoryIcon } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';

export default function LifecycleExplorer() {
  const [events, setEvents] = useState<any[]>([]);
  const { activeModule } = useModule();
  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getLifecycle().then(setEvents);
    } else {
      setEvents([]);
    }
  }, [activeModule]);

  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2">
        <HistoryIcon className="h-5 w-5" aria-hidden /> Event History
      </h2>
      {activeModule !== 'cannabis' && (
        <p className="text-sm text-gray-700 mb-3">The {activeModule} module UI is not yet implemented in this MVP.</p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Details</th>
              <th className="py-2 pr-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e: any, i) => (
              <tr key={i} className="text-gray-800">
                <td className="py-2 pr-4">{e.type}</td>
                <td className="py-2 pr-4">
                  {e.type === 'plant' ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden />
                      {e.strain} — {e.location}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                      {e.yieldGrams}g — {e.status}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  {new Date((e as any).plantedAt ?? (e as any).harvestedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
