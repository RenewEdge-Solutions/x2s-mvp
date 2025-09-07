import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { Beaker, ClipboardList, PackageCheck, Plus, X, Activity, AlertTriangle } from 'lucide-react';
import KPI from '../components/KPI';

type TestResult = {
  analyte: string;
  value: string;
  units?: string;
  limit?: string;
  pass?: boolean;
};

type Sample = {
  id: string;
  batchId: string;
  product: string;
  panel: 'Potency' | 'Pesticides' | 'Microbials' | 'Heavy metals';
  status: 'Intake' | 'In Testing' | 'Review' | 'COA Ready' | 'Failed';
  receivedAt: string; // ISO
  history?: Array<{ status: Sample['status']; at: string }>;
  coaGeneratedAt?: string; // ISO
  results?: TestResult[];
};

const initialSamples: Sample[] = [
  // Intake
  { id: 'S-1001', batchId: 'B-24-011', product: 'Flower', panel: 'Potency', status: 'Intake', receivedAt: new Date().toISOString() },
  { id: 'S-1004', batchId: 'B-24-012', product: 'Oil', panel: 'Pesticides', status: 'Intake', receivedAt: new Date(Date.now()-2*3600_000).toISOString() },
  { id: 'S-1006', batchId: 'B-24-013', product: 'Edible', panel: 'Microbials', status: 'Intake', receivedAt: new Date(Date.now()-4*3600_000).toISOString() },
  { id: 'S-1009', batchId: 'B-24-014', product: 'Vape', panel: 'Heavy metals', status: 'Intake', receivedAt: new Date(Date.now()-20*3600_000).toISOString() },
  { id: 'S-1012', batchId: 'B-24-017', product: 'Tincture', panel: 'Potency', status: 'Intake', receivedAt: new Date(Date.now()-26*3600_000).toISOString() },

  // In Testing
  { id: 'S-1002', batchId: 'B-24-009', product: 'Oil', panel: 'Pesticides', status: 'In Testing', receivedAt: new Date(Date.now()-86400000).toISOString() },
  { id: 'S-1005', batchId: 'B-24-010', product: 'Concentrate', panel: 'Heavy metals', status: 'In Testing', receivedAt: new Date(Date.now()-30*3600_000).toISOString() },
  { id: 'S-1011', batchId: 'B-24-016', product: 'Pre-roll', panel: 'Potency', status: 'In Testing', receivedAt: new Date(Date.now()-3*86400000).toISOString() },
  { id: 'S-1014', batchId: 'B-24-018', product: 'Flower', panel: 'Microbials', status: 'In Testing', receivedAt: new Date(Date.now()-40*3600_000).toISOString() },

  // Review
  { id: 'S-1003', batchId: 'B-24-008', product: 'Pre-roll', panel: 'Microbials', status: 'Review', receivedAt: new Date(Date.now()-2*86400000).toISOString() },
  { id: 'S-1008', batchId: 'B-24-015', product: 'Edible', panel: 'Pesticides', status: 'Review', receivedAt: new Date(Date.now()-56*3600_000).toISOString() },
  { id: 'S-1010', batchId: 'B-24-005', product: 'Flower', panel: 'Potency', status: 'Review', receivedAt: new Date(Date.now()-5*86400000).toISOString() },

  // COA Ready
  {
    id: 'S-1016',
    batchId: 'B-24-020',
    product: 'Oil',
    panel: 'Potency',
    status: 'COA Ready',
    receivedAt: new Date(Date.now()-6*86400000).toISOString(),
    history: [
      { status: 'Intake', at: new Date(Date.now()-7*86400000).toISOString() },
      { status: 'In Testing', at: new Date(Date.now()-6.5*86400000).toISOString() },
      { status: 'Review', at: new Date(Date.now()-6.2*86400000).toISOString() },
      { status: 'COA Ready', at: new Date(Date.now()-6*86400000).toISOString() },
    ],
  },
];

export default function Testing() {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Partial<Sample>>({ panel: 'Potency', product: 'Flower' });
  const [selected, setSelected] = useState<Sample | null>(null);
  const [advanceBusyId, setAdvanceBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [editResults, setEditResults] = useState<TestResult[]>([]);

  const byStatus = useMemo(() => ({
    Intake: samples.filter(s => s.status === 'Intake'),
    'In Testing': samples.filter(s => s.status === 'In Testing'),
    Review: samples.filter(s => s.status === 'Review'),
    'COA Ready': samples.filter(s => s.status === 'COA Ready'),
    Failed: samples.filter(s => s.status === 'Failed'),
  }), [samples]);

  // Initialize editable results when a sample is selected
  useEffect(() => {
    if (!selected) { setEditResults([]); return; }
    if (selected.results && selected.results.length > 0) {
      setEditResults(selected.results);
    } else {
      setEditResults(panelTemplate(selected.panel));
    }
  }, [selected?.id]);

  function panelTemplate(panel: Sample['panel']): TestResult[] {
    if (panel === 'Potency') return [
      { analyte: 'THC', value: '', units: '%', limit: '—', pass: undefined },
      { analyte: 'CBD', value: '', units: '%', limit: '—', pass: undefined },
      { analyte: 'Moisture', value: '', units: '%', limit: '< 13%', pass: undefined },
    ];
    if (panel === 'Pesticides') return [
      { analyte: 'Myclobutanil', value: '', units: 'ppm', limit: '< 0.2', pass: undefined },
      { analyte: 'Bifenthrin', value: '', units: 'ppm', limit: '< 0.1', pass: undefined },
    ];
    if (panel === 'Microbials') return [
      { analyte: 'Total Yeast & Mold', value: '', units: 'CFU/g', limit: '< 10,000', pass: undefined },
      { analyte: 'Salmonella', value: '', units: '', limit: 'ND', pass: undefined },
    ];
    return [
      { analyte: 'Lead (Pb)', value: '', units: 'ppm', limit: '< 0.5', pass: undefined },
      { analyte: 'Cadmium (Cd)', value: '', units: 'ppm', limit: '< 0.2', pass: undefined },
    ];
  }

  function getAdvanceLabel(status: Sample['status']) {
    if (status === 'Intake') return 'Push to Testing';
    if (status === 'In Testing') return 'Push to Review';
    if (status === 'Review') return 'Mark COA Ready';
    return 'Advance';
  }

  const addSample = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `S-${Math.max(1000, ...samples.map(s => parseInt(s.id.split('-')[1]) || 1000)) + 1}`;
    const s: Sample = {
      id,
      batchId: String(form.batchId || 'B-24-012'),
      product: String(form.product || 'Flower'),
      panel: (form.panel as Sample['panel']) || 'Potency',
      status: 'Intake',
      receivedAt: new Date().toISOString(),
      history: [{ status: 'Intake', at: new Date().toISOString() }],
    };
    setSamples(prev => [s, ...prev]);
    setDrawerOpen(false);
    setFlash(`Sample ${id} added to Intake`);
    setTimeout(() => setFlash(null), 2000);
  };

  const advance = (id: string) => {
    const target = samples.find(s => s.id === id);
    if (!target) return;
    const next = target.status === 'Intake' ? 'In Testing' : target.status === 'In Testing' ? 'Review' : target.status === 'Review' ? 'COA Ready' : target.status;
    if (next === target.status) return;
    setAdvanceBusyId(id);
    setTimeout(() => {
      setSamples(prev => prev.map(s => s.id === id ? ({
        ...s,
        status: next as Sample['status'],
        history: [...(s.history || []), { status: next as Sample['status'], at: new Date().toISOString() }],
      }) : s));
      setAdvanceBusyId(null);
      setFlash(`Advanced ${id} to ${next}`);
      setTimeout(() => setFlash(null), 2000);
    }, 600);
  };

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <Beaker className="h-6 w-6 text-emerald-600" aria-hidden /> Testing
        </h1>
        <button onClick={() => { setForm({ panel: 'Potency', product: 'Flower' }); setDrawerOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50">
          <Plus className="h-4 w-4" aria-hidden /> Intake sample
        </button>
      </div>

      {/* KPIs row (shared style) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <KPI label="Intake" value={byStatus['Intake'].length} icon={<ClipboardList className="h-5 w-5 text-emerald-600" />} />
        <KPI label="In testing" value={byStatus['In Testing'].length} icon={<Beaker className="h-5 w-5 text-emerald-600" />} />
        <KPI label="Review" value={byStatus['Review'].length} icon={<ClipboardList className="h-5 w-5 text-emerald-600" />} />
        <KPI label="COA ready" value={byStatus['COA Ready'].length} icon={<PackageCheck className="h-5 w-5 text-emerald-600" />} />
        <KPI label="Failed (7d)" value={byStatus['Failed'].length} icon={<AlertTriangle className="h-5 w-5 text-emerald-600" />} />
        <KPI label="Avg TAT (days)" value={4.2} icon={<Activity className="h-5 w-5 text-emerald-600" />} />
      </div>

  <Card title="Samples">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {(
            [
              { key: 'Intake', label: 'Intake' },
              { key: 'In Testing', label: 'In Testing' },
              { key: 'Review', label: 'Review' },
            ] as const
          ).map(col => (
            <div key={col.key} className="rounded-lg border border-gray-200 p-2">
              <div className="text-sm font-medium text-gray-800 mb-2 flex items-center justify-between">
                <span>{col.label}</span>
                <span className="text-[11px] text-gray-500">{byStatus[col.key].length}</span>
              </div>
              <ul className="space-y-2">
                {byStatus[col.key].map(s => (
                  <li key={s.id} className={`rounded-md border border-gray-200 p-2 text-sm cursor-pointer hover:bg-gray-50 ${selected?.id === s.id ? 'ring-1 ring-primary' : ''}`} onClick={() => setSelected(s)}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{s.id} • {s.batchId}</div>
                      <span className="text-[11px] text-gray-500">{s.panel}</span>
                    </div>
                    <div className="text-xs text-gray-600">{s.product}</div>
                    <div className="text-xs text-gray-500">Received {new Date(s.receivedAt).toLocaleString()}</div>
                  </li>
                ))}
                {byStatus[col.key].length === 0 && <li className="text-xs text-gray-500">No items</li>}
              </ul>
            </div>
          ))}

          {/* Details panel */}
          <div className="rounded-lg border border-gray-200 p-2 lg:col-span-1">
            <div className="text-sm font-medium text-gray-800 mb-2">Details</div>
            {!selected ? (
              <div className="text-xs text-gray-500">Select a sample to view details</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-900">{selected.id} • {selected.batchId}</div>
                <div className="text-xs text-gray-600">{selected.product} • {selected.panel}</div>
                <div className="text-xs text-gray-500">Received {new Date(selected.receivedAt).toLocaleString()}</div>
                {selected.coaGeneratedAt && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 inline-flex items-center gap-1 px-2 py-0.5 rounded">COA generated {new Date(selected.coaGeneratedAt).toLocaleString()}</div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Actions</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-xs hover:bg-gray-50 disabled:opacity-60"
                      onClick={() => advance(selected.id)}
                      disabled={advanceBusyId === selected.id || selected.status === 'COA Ready'}
                    >
                      {advanceBusyId === selected.id ? 'Advancing…' : getAdvanceLabel(selected.status)}
                    </button>
                  </div>
                </div>

                {(selected.status === 'In Testing' || selected.status === 'Review') && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Enter test results</div>
                    <div className="overflow-auto">
                      <table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="text-left px-2 py-1 border-b">Analyte</th>
                            <th className="text-left px-2 py-1 border-b">Result</th>
                            <th className="text-left px-2 py-1 border-b">Units</th>
                            <th className="text-left px-2 py-1 border-b">Limit</th>
                            <th className="text-left px-2 py-1 border-b">Pass?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editResults.map((r, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1"><input value={r.analyte} onChange={e=>setEditResults(arr=>arr.map((it,i)=>i===idx?{...it, analyte:e.target.value}:it))} className="w-full border-gray-300 rounded" /></td>
                              <td className="px-2 py-1"><input value={r.value} onChange={e=>setEditResults(arr=>arr.map((it,i)=>i===idx?{...it, value:e.target.value}:it))} className="w-full border-gray-300 rounded" /></td>
                              <td className="px-2 py-1"><input value={r.units||''} onChange={e=>setEditResults(arr=>arr.map((it,i)=>i===idx?{...it, units:e.target.value}:it))} className="w-full border-gray-300 rounded" /></td>
                              <td className="px-2 py-1"><input value={r.limit||''} onChange={e=>setEditResults(arr=>arr.map((it,i)=>i===idx?{...it, limit:e.target.value}:it))} className="w-full border-gray-300 rounded" /></td>
                              <td className="px-2 py-1">
                                <select value={r.pass===undefined?'':(r.pass?'Pass':'Fail')} onChange={e=>setEditResults(arr=>arr.map((it,i)=>i===idx?{...it, pass: e.target.value===''?undefined:(e.target.value==='Pass')}:it))} className="w-full border-gray-300 rounded">
                                  <option value="">—</option>
                                  <option value="Pass">Pass</option>
                                  <option value="Fail">Fail</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="px-2 py-1 border rounded-md text-xs hover:bg-gray-50" onClick={()=>setEditResults(arr=>[...arr, { analyte: '', value: '', units: '', limit: '', pass: undefined }])}>Add row</button>
                      <button className="px-2 py-1 border rounded-md text-xs hover:bg-gray-50" onClick={()=>setEditResults(panelTemplate(selected.panel))}>Load template</button>
                      <button
                        className="px-2 py-1 border rounded-md text-xs hover:bg-gray-50"
                        onClick={() => {
                          setSamples(prev => prev.map(s => s.id === selected.id ? ({ ...s, results: editResults }) : s));
                          setSelected(sel => sel && sel.id === selected.id ? ({ ...sel, results: editResults }) : sel);
                          setFlash(`Saved results for ${selected.id}`);
                          setTimeout(() => setFlash(null), 1800);
                        }}
                      >
                        Save results
                      </button>
                    </div>
                  </div>
                )}
                {selected.history && selected.history.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">History</div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {selected.history.map((h, i) => (
                        <li key={i} className="flex items-center justify-between"><span>{h.status}</span><span className="text-gray-500">{new Date(h.at).toLocaleString()}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {flash && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">{flash}</div>
      )}

      {/* Right-side drawer for intake (replaces modal) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2"><ClipboardList className="h-5 w-5" aria-hidden /> Intake sample</div>
              <button className="text-gray-500" onClick={() => setDrawerOpen(false)}><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <form onSubmit={addSample} className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Batch ID</div>
                <input value={form.batchId || ''} onChange={e=>setForm(f=>({...f, batchId:e.target.value}))} className="w-full rounded-md border-gray-300" placeholder="B-24-012" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <select value={String(form.product)} onChange={e=>setForm(f=>({...f, product:e.target.value}))} className="w-full rounded-md border-gray-300">
                  {['Flower','Oil','Edible','Pre-roll'].map(p=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500">Panel</div>
                <select value={String(form.panel)} onChange={e=>setForm(f=>({...f, panel:e.target.value as Sample['panel']}))} className="w-full rounded-md border-gray-300">
                  {['Potency','Pesticides','Microbials','Heavy metals'].map(p=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="pt-1">
                <button className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50"><Plus className="h-4 w-4" aria-hidden /> Add</button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
