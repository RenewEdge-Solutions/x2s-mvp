import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import WizardSteps from '../components/WizardSteps';
import Card from '../components/Card';

export default function Wizard() {
  const { user } = useAuth();
  const { activeModule } = useModule();
  const [step, setStep] = useState<1 | 2>(1);
  const [strain, setStrain] = useState('OG Kush');
  const [location, setLocation] = useState('Greenhouse A');
  const [plantHash, setPlantHash] = useState<string | null>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [plantId, setPlantId] = useState<string>('');
  const [yieldGrams, setYieldGrams] = useState<number>(100);
  const [status, setStatus] = useState<'drying' | 'dried'>('drying');
  const [harvestHash, setHarvestHash] = useState<string | null>(null);

  const { search } = useLocation();
  const stepFromQuery = useMemo(() => new URLSearchParams(search).get('step'), [search]);

  useEffect(() => {
    if (stepFromQuery === '2') setStep(2);
    if (stepFromQuery === '1') setStep(1);
  }, [stepFromQuery]);

  useEffect(() => {
    api.getPlants().then((ps) => setPlants(ps));
  }, [step]);

  const submitPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createPlant({ strain, location, by: user?.username });
    setPlantHash(res.hash);
    setStep(2);
  };

  const submitHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createHarvest({ plantId, yieldGrams, status, by: user?.username });
    setHarvestHash(res.hash);
  };

  if (activeModule !== 'cannabis') {
  return <div className="text-sm text-gray-600">Switch to the Cannabis module to access actions.</div>;
  }

  if (user?.role !== 'Operator') {
  return <div className="text-sm text-gray-600">Only Operators can perform these actions.</div>;
  }

  return (
    <div className="space-y-6">
  <WizardSteps step={step} />

      <Card>
        {step === 1 ? (
          <form onSubmit={submitPlant} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Strain</label>
              <input value={strain} onChange={(e) => setStrain(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <button className="bg-primary text-white rounded-md px-4 py-2">Plant Seed</button>
            {plantHash && (
              <p className="text-sm text-gray-600">Server Hash: <span className="font-mono">{plantHash}</span></p>
            )}
          </form>
        ) : (
          <form onSubmit={submitHarvest} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Plant</label>
              <select value={plantId} onChange={(e) => setPlantId(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md">
                <option value="">Select plant</option>
                {plants.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.strain} — {p.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Yield (g)</label>
                <input type="number" value={yieldGrams} onChange={(e) => setYieldGrams(Number(e.target.value))} className="mt-1 w-full border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-1 w-full border-gray-300 rounded-md">
                  <option value="drying">drying</option>
                  <option value="dried">dried</option>
                </select>
              </div>
            </div>
            <button className="bg-primary text-white rounded-md px-4 py-2">Create Harvest</button>
            {harvestHash && (
              <p className="text-sm text-gray-600">Server Hash: <span className="font-mono">{harvestHash}</span></p>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
