import React from 'react';
import KPI from '../components/KPI';
import { Package2, Repeat, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';

export default function ExplosivesDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Explosives Module</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KPI label="Active Lots" value={4} icon={<Package2 className="h-4 w-4" aria-hidden />} />
  <KPI label="Transfers (7d)" value={2} icon={<Repeat className="h-4 w-4" aria-hidden />} />
  <KPI label="Alerts" value={1} icon={<ShieldAlert className="h-4 w-4 text-amber-500" aria-hidden />} />
      </div>
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
        <ul className="text-sm text-gray-700 list-disc pl-5">
          <li>Lot created: EXP-1031</li>
          <li>Transfer recorded: TRF-201</li>
          <li>Compliance check passed: EXP-0992</li>
        </ul>
      </Card>
    </div>
  );
}
