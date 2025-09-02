import React from 'react';
import KPI from '../components/KPI';
import { Sprout, PackageCheck, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

export default function MushroomsDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Mushrooms Module</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KPI label="Active Grow Beds" value={7} icon={<Sprout className="h-4 w-4" aria-hidden />} />
  <KPI label="Harvests (7d)" value={3} icon={<PackageCheck className="h-4 w-4" aria-hidden />} />
  <KPI label="Alerts" value={0} icon={<AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />} />
      </div>
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
        <ul className="text-sm text-gray-700 list-disc pl-5">
          <li>Inoculation complete: Bed M-12</li>
          <li>Fruiting started: Bed M-07</li>
          <li>Shipment created: SHP-M-0009</li>
        </ul>
      </Card>
    </div>
  );
}
