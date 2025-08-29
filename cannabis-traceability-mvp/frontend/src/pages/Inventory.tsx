import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import { Package as PackageIcon, Sprout, Scissors } from 'lucide-react';

export default function Inventory() {
  const { activeModule } = useModule();
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);

  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getPlants().then(setPlants);
      api.getHarvests().then(setHarvests);
    } else {
      setPlants([]);
      setHarvests([]);
    }
  }, [activeModule]);

  const summary = useMemo(() => {
    const activePlants = plants.filter((p) => !p.harvested).length;
    const drying = harvests.filter((h) => h.status === 'drying').length;
    const dried = harvests.filter((h) => h.status === 'dried').length;
    return { activePlants, drying, dried };
  }, [plants, harvests]);

  if (activeModule !== 'cannabis') {
    return (
      <Card>
        <p className="text-sm text-gray-700">Inventory for {activeModule} is not yet implemented in this MVP.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
        <PackageIcon className="h-6 w-6" aria-hidden /> Inventory
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Active plants</div>
          <div className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1">
            <Sprout className="h-5 w-5 text-green-600" aria-hidden /> {summary.activePlants}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Harvest lots (drying)</div>
          <div className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1">
            <Scissors className="h-5 w-5 text-amber-600" aria-hidden /> {summary.drying}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Harvest lots (dried)</div>
          <div className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1">
            <Scissors className="h-5 w-5 text-emerald-700" aria-hidden /> {summary.dried}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Plants in production</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Strain</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Planted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plants
                .filter((p) => !p.harvested)
                .slice(0, 20)
                .map((p) => (
                  <tr key={p.id} className="text-gray-800">
                    <td className="py-2 pr-4">{p.strain}</td>
                    <td className="py-2 pr-4">{p.location}</td>
                    <td className="py-2 pr-4">{new Date(p.plantedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Harvest lots</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {harvests.slice(0, 20).map((h) => (
                <tr key={h.id} className="text-gray-800">
                  <td className="py-2 pr-4 font-mono text-xs">{h.id}</td>
                  <td className="py-2 pr-4">{h.yieldGrams} g</td>
                  <td className="py-2 pr-4 capitalize">{h.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
