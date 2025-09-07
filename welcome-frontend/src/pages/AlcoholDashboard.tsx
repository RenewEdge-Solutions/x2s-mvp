import React from 'react';
import KPI from '../components/KPI';
import { Beer, Truck, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

export default function AlcoholDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Alcohol Module</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KPI label="Active Batches" value={12} icon={<Beer className="h-4 w-4" aria-hidden />} />
  <KPI label="Shipments (7d)" value={5} icon={<Truck className="h-4 w-4" aria-hidden />} />
  <KPI label="Alerts" value={1} icon={<AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />} />
      </div>
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
        <ul className="text-sm text-gray-700 list-disc pl-5">
          <li>Fermentation started: Batch A-102</li>
          <li>Distillation complete: Batch D-221</li>
          <li>Shipment created: SHP-00045</li>
        </ul>
      </Card>
    </div>
  );
}
