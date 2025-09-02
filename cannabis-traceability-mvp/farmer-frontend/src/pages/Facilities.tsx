import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { Building2, AlertTriangle, MoveRight, Search as SearchIcon, ArrowRightLeft, User2, FileText, MapPin, Scale, ShieldCheck, Calendar as CalendarIcon, Copy, Mail, Printer, RefreshCcw } from 'lucide-react';
import { api } from '../lib/api';

type Row = { structureId: string; structure: string; facility: string; occupied: number; capacity: number };
type Risk = 'Low' | 'Medium' | 'High';
type Licensee = {
  id: string;
  name: string;
  licenceId: string;
  class: 'Cultivation' | 'Manufacturing' | 'Laboratory' | 'Retail/Dispensary';
  district: string;
  status: 'Active' | 'Suspended' | 'Expired';
  licenceExpiry: string; // ISO date
  risk: Risk;
  complianceScore: number; // 0-100
  alerts: number; // open alerts
  investigations: number; // open investigations
  lastInspection?: string; // ISO
  nextInspection?: string; // ISO
  plants: number;
  batches: number;
  products: number;
  coaPassRate: number; // %
  sites: string[];
  contactEmail?: string;
};
type Alerts = {
  emptyStructures?: any[];
  lowUtilizationStructures?: any[];
  overCapacityStructures?: any[];
};

export default function Facilities() {
  const [rows, setRows] = useState<Row[]>([]);
  const [alerts, setAlerts] = useState<Alerts>({});
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'empty' | 'low' | 'normal' | 'over'>('all');
  const [active, setActive] = useState<Row | null>(null);
  const [licensees, setLicensees] = useState<Licensee[]>([
    { id: 'LIC-1021', name: 'Green Leaf Holdings', licenceId: 'LIC-1021', class: 'Cultivation', district: 'Castries', status: 'Active', licenceExpiry: daysFromNow(180), risk: 'Medium', complianceScore: 82, alerts: 2, investigations: 0, lastInspection: daysFromNow(-90), nextInspection: daysFromNow(30), plants: 12400, batches: 52, products: 8, coaPassRate: 95, sites: ['Farm HQ', 'Outdoor Plot 1'], contactEmail: 'compliance@greenleaf.example' },
    { id: 'LIC-1094', name: 'Medicanna Labs Ltd', licenceId: 'LIC-1094', class: 'Laboratory', district: 'Gros Islet', status: 'Active', licenceExpiry: daysFromNow(240), risk: 'Low', complianceScore: 91, alerts: 0, investigations: 0, lastInspection: daysFromNow(-60), nextInspection: daysFromNow(90), plants: 0, batches: 74, products: 12, coaPassRate: 98, sites: ['State Laboratory'], contactEmail: 'ops@medicanna.example' },
    { id: 'LIC-1055', name: 'Sunrise Processing', licenceId: 'LIC-1055', class: 'Manufacturing', district: 'Vieux Fort', status: 'Active', licenceExpiry: daysFromNow(120), risk: 'High', complianceScore: 67, alerts: 4, investigations: 1, lastInspection: daysFromNow(-45), nextInspection: daysFromNow(20), plants: 0, batches: 96, products: 24, coaPassRate: 88, sites: ['Processing Plant'], contactEmail: 'qa@sunriseproc.example' },
    { id: 'LIC-1102', name: 'Harbor Dispensary', licenceId: 'LIC-1102', class: 'Retail/Dispensary', district: 'Soufrière', status: 'Suspended', licenceExpiry: daysFromNow(15), risk: 'High', complianceScore: 54, alerts: 6, investigations: 2, lastInspection: daysFromNow(-20), nextInspection: undefined, plants: 0, batches: 12, products: 140, coaPassRate: 92, sites: ['Retail East'], contactEmail: 'store@harbor.example' },
    { id: 'LIC-1110', name: 'Emerald Valley Farm', licenceId: 'LIC-1110', class: 'Cultivation', district: 'Dennery', status: 'Active', licenceExpiry: daysFromNow(365), risk: 'Low', complianceScore: 89, alerts: 1, investigations: 0, lastInspection: daysFromNow(-120), nextInspection: daysFromNow(60), plants: 8900, batches: 34, products: 5, coaPassRate: 96, sites: ['Greenhouse A', 'Greenhouse B'], contactEmail: 'admin@emeraldvalley.example' },
    { id: 'LIC-1115', name: 'South Coast Dispensary', licenceId: 'LIC-1115', class: 'Retail/Dispensary', district: 'Laborie', status: 'Expired', licenceExpiry: daysFromNow(-10), risk: 'Medium', complianceScore: 70, alerts: 2, investigations: 0, lastInspection: daysFromNow(-200), nextInspection: undefined, plants: 0, batches: 5, products: 90, coaPassRate: 90, sites: ['Retail South'], contactEmail: 'support@southcoast.example' },
  { id: 'LIC-1120', name: 'Blue Mountain Growers', licenceId: 'LIC-1120', class: 'Cultivation', district: 'Choiseul', status: 'Active', licenceExpiry: daysFromNow(200), risk: 'Medium', complianceScore: 76, alerts: 1, investigations: 0, lastInspection: daysFromNow(-80), nextInspection: daysFromNow(40), plants: 6400, batches: 22, products: 4, coaPassRate: 93, sites: ['Terrace Fields'], contactEmail: 'info@bluemountain.example' },
  { id: 'LIC-1125', name: 'Island Wellness Retail', licenceId: 'LIC-1125', class: 'Retail/Dispensary', district: 'Castries', status: 'Active', licenceExpiry: daysFromNow(300), risk: 'Low', complianceScore: 88, alerts: 0, investigations: 0, lastInspection: daysFromNow(-35), nextInspection: daysFromNow(120), plants: 0, batches: 8, products: 170, coaPassRate: 97, sites: ['Downtown Store'], contactEmail: 'retail@islandwellness.example' },
  { id: 'LIC-1130', name: 'GreenWave Labs', licenceId: 'LIC-1130', class: 'Laboratory', district: 'Vieux Fort', status: 'Active', licenceExpiry: daysFromNow(420), risk: 'Low', complianceScore: 94, alerts: 0, investigations: 0, lastInspection: daysFromNow(-50), nextInspection: daysFromNow(140), plants: 0, batches: 102, products: 18, coaPassRate: 99, sites: ['Quality Lab West'], contactEmail: 'lab@greenwave.example' },
  { id: 'LIC-1135', name: 'Carib Extracts', licenceId: 'LIC-1135', class: 'Manufacturing', district: 'Vieux Fort', status: 'Active', licenceExpiry: daysFromNow(150), risk: 'Medium', complianceScore: 72, alerts: 3, investigations: 1, lastInspection: daysFromNow(-65), nextInspection: daysFromNow(25), plants: 0, batches: 64, products: 20, coaPassRate: 91, sites: ['Extraction Plant'], contactEmail: 'compliance@caribextracts.example' },
  { id: 'LIC-1140', name: 'Northern Lights Lab', licenceId: 'LIC-1140', class: 'Laboratory', district: 'Gros Islet', status: 'Active', licenceExpiry: daysFromNow(280), risk: 'Low', complianceScore: 90, alerts: 0, investigations: 0, lastInspection: daysFromNow(-90), nextInspection: daysFromNow(60), plants: 0, batches: 84, products: 10, coaPassRate: 98, sites: ['Bio Lab North'], contactEmail: 'admin@northernlights.example' },
  { id: 'LIC-1145', name: 'Harbor Wellness', licenceId: 'LIC-1145', class: 'Retail/Dispensary', district: 'Soufrière', status: 'Active', licenceExpiry: daysFromNow(90), risk: 'Medium', complianceScore: 69, alerts: 2, investigations: 0, lastInspection: daysFromNow(-25), nextInspection: daysFromNow(75), plants: 0, batches: 10, products: 120, coaPassRate: 89, sites: ['Harbor Front'], contactEmail: 'contact@harborwellness.example' },
  ]);
  const [activeLicensee, setActiveLicensee] = useState<Licensee | null>(null);
  const [accountCreds, setAccountCreds] = useState<{ username: string; password: string } | null>(null);
  // Schedule inspection (mock) modal
  const [scheduleFor, setScheduleFor] = useState<Licensee | null>(null);
  const [scheduleForm, setScheduleForm] = useState<{ type: 'Routine' | 'Follow-up' | 'Complaint'; date: string; time: string; assignedTo: string; notes: string; notify: boolean }>({
    type: 'Routine',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
    time: '09:00',
    assignedTo: 'Inspector A',
    notes: '',
    notify: true,
  });
  // Notice of deficiency (mock) modal
  const [defFor, setDefFor] = useState<Licensee | null>(null);
  const [defForm, setDefForm] = useState<{ category: string; severity: 'Minor' | 'Major' | 'Critical'; description: string; dueDate: string; actions: string; notify: boolean }>({
    category: 'Documentation',
    severity: 'Major',
    description: '',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10),
    actions: 'Submit corrective action plan (CAPA) and evidence of remediation.',
    notify: true,
  });
  const updateStatus = (id: string, next: Licensee['status']) => {
    setLicensees(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
  };
  useEffect(() => { setAccountCreds(null); }, [activeLicensee]);
  // Filters for operators
  const [opQ, setOpQ] = useState('');
  const [opClass, setOpClass] = useState<'all' | Licensee['class']>('all');
  const [opStatus, setOpStatus] = useState<'all' | Licensee['status']>('all');
  const [opDistrict, setOpDistrict] = useState<'all' | string>('all');
  const [opRisk, setOpRisk] = useState<'all' | Risk>('all');

  useEffect(() => {
    api.getAllOccupancy().then((r) => setRows(r as Row[]));
    api.getEmptyCapacityAlerts?.().then((a: any) => setAlerts(a || {}));
  }, []);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    const facilities = Array.from(new Set(rows.map((r) => r.facility)));
    const totals = rows.reduce(
      (acc, r) => {
        acc.occ += r.occupied;
        acc.cap += Math.max(1, r.capacity);
        return acc;
      },
      { occ: 0, cap: 0 }
    );
    const avg = totals.cap ? Math.round((totals.occ / totals.cap) * 100) : 0;
    return {
      facilityCount: facilities.length,
      avgOccupancy: `${avg}%`,
      overCount: alerts.overCapacityStructures?.length || 0,
      emptyCount: alerts.emptyStructures?.length || 0,
    };
  }, [rows, alerts]);

  // Status helpers
  const getRate = (r: Row) => (Math.max(0, r.occupied) / Math.max(1, r.capacity));
  const getStatus = (r: Row): 'empty' | 'low' | 'normal' | 'over' => {
    const rate = getRate(r);
    if (rate === 0) return 'empty';
    if (rate > 1) return 'over';
    if (rate < 0.3) return 'low';
    return 'normal';
  };

  // Filters
  const filtered = rows.filter((r) => {
    const matchesQ = !q.trim() || `${r.facility} ${r.structure}`.toLowerCase().includes(q.toLowerCase());
    const s = getStatus(r);
    const matchesS = status === 'all' || s === status;
    return matchesQ && matchesS;
  });

  // Group by facility
  const grouped = useMemo(() => {
    const map: Record<string, Row[]> = {};
    filtered.forEach((r) => {
      map[r.facility] ||= [];
      map[r.facility].push(r);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
    <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
  <Building2 className="h-5 w-5 text-emerald-600" aria-hidden /> Operators
    </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Kpi label="Operators" value={licensees.length} />
        <Kpi label="Active" value={licensees.filter(l => l.status === 'Active').length} />
        <Kpi label="Suspended" value={licensees.filter(l => l.status === 'Suspended').length} tone="rose" />
        <Kpi label="High risk" value={licensees.filter(l => l.risk === 'High').length} tone="amber" />
        <Kpi label="Open investigations" value={licensees.reduce((a,b)=>a+b.investigations,0)} />
        <Kpi label="Avg. occupancy" value={kpis.avgOccupancy} />
      </div>

      {/* Operators directory */}
      <Card title="Operators" subtitle={`${licensees.length} total`}>
        <div className="mb-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-gray-500 inline-flex items-center gap-1">Filters</div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            <div className="relative w-full lg:w-[28rem]">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" aria-hidden />
              <input value={opQ} onChange={e=>setOpQ(e.target.value)} placeholder="Search name, licence, site, district" className="w-full rounded-md border border-gray-300 pl-8 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={opClass} onChange={e=>setOpClass(e.target.value as any)} className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All classes</option>
                <option value="Cultivation">Cultivation</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Retail/Dispensary">Retail/Dispensary</option>
              </select>
              <select value={opStatus} onChange={e=>setOpStatus(e.target.value as any)} className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
              <select value={opRisk} onChange={e=>setOpRisk(e.target.value as any)} className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All risk</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select value={opDistrict} onChange={e=>setOpDistrict(e.target.value)} className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All districts</option>
                {Array.from(new Set(licensees.map(l=>l.district))).map(d=>(<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            {(opQ || opClass!=='all' || opStatus!=='all' || opDistrict!=='all' || opRisk!=='all') && (
              <button className="lg:ml-auto rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{setOpQ('');setOpClass('all');setOpStatus('all');setOpDistrict('all');setOpRisk('all');}}>Clear</button>
            )}
          </div>
        </div>
  <div className="overflow-auto max-h-[864px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {licensees.filter(l=>{
            const matchesQ=!opQ.trim() || `${l.name} ${l.licenceId} ${l.district} ${l.sites.join(' ')}`.toLowerCase().includes(opQ.toLowerCase());
            const matchesC=opClass==='all'||l.class===opClass;
            const matchesS=opStatus==='all'||l.status===opStatus;
            const matchesD=opDistrict==='all'||l.district===opDistrict;
            const matchesR=opRisk==='all'||l.risk===opRisk;
            return matchesQ&&matchesC&&matchesS&&matchesD&&matchesR;
          }).map(l=>{
            const structCount=rows.filter(r=>r.facility===l.name).length;
            const siteCount=l.sites.length;
            return (
              <div key={l.id} className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 h-[280px] overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.licenceId} • Expires {new Date(l.licenceExpiry).toLocaleDateString()}</div>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Badge label={l.status} tone={l.status==='Active'?'emerald':l.status==='Suspended'?'rose':'gray'} />
                    <Badge label={l.risk} tone={l.risk==='High'?'rose':l.risk==='Medium'?'amber':'gray'} />
                    {l.investigations>0 && <Badge label="Investigate" tone="rose" />}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1"><Scale className="h-3.5 w-3.5 text-emerald-600"/> {l.class}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-600"/> {l.district}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Compliance</span>
                    <span className="font-medium text-gray-800">{l.complianceScore}%</span>
                  </div>
                  <Progress value={l.complianceScore} max={100} scheme="good-high" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-700">
                  <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 p-2 text-center"><div className="font-semibold">{siteCount}</div><div className="text-gray-500">Sites</div></div>
                  <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 p-2 text-center"><div className="font-semibold">{structCount}</div><div className="text-gray-500">Structures</div></div>
                  <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 p-2 text-center"><div className="font-semibold">{l.alerts}</div><div className="text-gray-500">Alerts</div></div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <span>Inspections:</span>
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600"/> Last {l.lastInspection?new Date(l.lastInspection).toLocaleDateString():'—'}</span>
                    <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5 text-emerald-600"/> Next {l.nextInspection?new Date(l.nextInspection).toLocaleDateString():'—'}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" onClick={()=>setActiveLicensee(l)}>View</button>
                  <button className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-emerald-300 text-emerald-700 px-2 py-1 text-xs hover:bg-emerald-50" onClick={() => { setScheduleFor(l); setScheduleForm((f)=>({ ...f, date: new Date(Date.now()+1000*60*60*24*14).toISOString().slice(0,10) })); }}>Schedule inspection</button>
                  <button className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-amber-300 text-amber-700 px-2 py-1 text-xs hover:bg-amber-50" onClick={() => { setDefFor(l); setDefForm((f)=>({ ...f, dueDate: new Date(Date.now()+1000*60*60*24*21).toISOString().slice(0,10) })); }}>Notice of deficiency</button>
                  {l.status==='Suspended' ? (
                    <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:opacity-95" onClick={()=>updateStatus(l.id,'Active')}>Reinstate</button>
                  ) : (
                    <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:opacity-95" onClick={()=>updateStatus(l.id,'Suspended')}>Suspend</button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </Card>


      {/* Facilities and structures */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <div className="text-sm text-gray-500">No license holders or sites match the current filters.</div>
        </Card>
      ) : (
  Object.entries(grouped).filter(([facility]) => facility !== 'Farm HQ').map(([facility, items]) => {
          const totalOcc = items.reduce((a, b) => a + b.occupied, 0);
          const totalCap = items.reduce((a, b) => a + Math.max(1, b.capacity), 0);
          const rate = Math.round((totalOcc / Math.max(1, totalCap)) * 100);
          return (
            <Card key={facility} title={facility} subtitle={`${items.length} structures • ${rate}% utilized`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((r) => (
                  <button
                    key={r.structureId}
                    className="text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    onClick={() => setActive(r)}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600" aria-hidden />
                        <span className="text-gray-800">{r.structure}</span>
                      </div>
                      <span>
                        {r.occupied}/{r.capacity}
                      </span>
                    </div>
                    <Progress value={r.occupied} max={r.capacity} />
                    <div className="mt-1 text-[11px] text-gray-500 capitalize">Status: {getStatus(r)}</div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })
      )}

      {/* Modal: Schedule inspection (mock) */}
      {scheduleFor && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setScheduleFor(null)} />
          <div className="absolute inset-x-0 top-[10%] mx-auto w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Schedule inspection</div>
                <div className="text-lg font-semibold text-gray-900">{scheduleFor.name} <span className="text-xs text-gray-500 font-normal">• {scheduleFor.licenceId}</span></div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setScheduleFor(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Inspection type</label>
                  <select value={scheduleForm.type} onChange={(e)=>setScheduleForm(f=>({...f, type: e.target.value as any}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Routine</option>
                    <option>Follow-up</option>
                    <option>Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Assigned inspector</label>
                  <select value={scheduleForm.assignedTo} onChange={(e)=>setScheduleForm(f=>({...f, assignedTo: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Inspector A</option>
                    <option>Inspector B</option>
                    <option>Inspector C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input type="date" value={scheduleForm.date} onChange={(e)=>setScheduleForm(f=>({...f, date: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Time</label>
                  <input type="time" value={scheduleForm.time} onChange={(e)=>setScheduleForm(f=>({...f, time: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea rows={3} value={scheduleForm.notes} onChange={(e)=>setScheduleForm(f=>({...f, notes: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Focus on storage area, batch reconciliation, SOP adherence..." />
              </div>
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={scheduleForm.notify} onChange={(e)=>setScheduleForm(f=>({...f, notify: e.target.checked}))} />
                <span>Notify operator via email</span>
              </label>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={()=>setScheduleFor(null)}>Cancel</button>
                <button className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:opacity-95" onClick={()=>{
                  // Update next inspection date (mock persist)
                  const when = new Date(scheduleForm.date);
                  setLicensees(prev=>prev.map(x=>x.id===scheduleFor.id?{...x, nextInspection: when.toISOString()}:x));
                  setScheduleFor(null);
                }}>Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Notice of deficiency (mock) */}
      {defFor && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDefFor(null)} />
          <div className="absolute inset-x-0 top-[8%] mx-auto w-full max-w-2xl rounded-lg bg-white shadow-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Issue notice of deficiency</div>
                <div className="text-lg font-semibold text-gray-900">{defFor.name} <span className="text-xs text-gray-500 font-normal">• {defFor.licenceId}</span></div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setDefFor(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Category</label>
                  <select value={defForm.category} onChange={(e)=>setDefForm(f=>({...f, category: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Documentation</option>
                    <option>Security</option>
                    <option>Inventory control</option>
                    <option>Quality & labelling</option>
                    <option>Sanitation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <select value={defForm.severity} onChange={(e)=>setDefForm(f=>({...f, severity: e.target.value as any}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Minor</option>
                    <option>Major</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CAPA due date</label>
                  <input type="date" value={defForm.dueDate} onChange={(e)=>setDefForm(f=>({...f, dueDate: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Deficiency description</label>
                <textarea rows={4} value={defForm.description} onChange={(e)=>setDefForm(f=>({...f, description: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Describe the observed non‑conformance, evidence, and references to regulations/SOPs..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Required actions</label>
                <textarea rows={3} value={defForm.actions} onChange={(e)=>setDefForm(f=>({...f, actions: e.target.value}))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={defForm.notify} onChange={(e)=>setDefForm(f=>({...f, notify: e.target.checked}))} />
                <span>Email notice to operator</span>
              </label>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={()=>setDefFor(null)}>Cancel</button>
                <button className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:opacity-95" onClick={()=>{
                  // Update alerts/risk (mock persist)
                  setLicensees(prev=>prev.map(x=>{
                    if (x.id!==defFor.id) return x;
                    let risk = x.risk;
                    if (defForm.severity==='Critical') risk = 'High';
                    else if (defForm.severity==='Major' && x.risk==='Low') risk = 'Medium';
                    return { ...x, alerts: x.alerts + 1, investigations: defForm.severity!=='Minor' ? x.investigations + 1 : x.investigations, risk };
                  }));
                  setDefFor(null);
                }}>Issue notice</button>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Drawer: structure actions (mock) */}
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setActive(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
            <div className="p-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Structure</div>
                <div className="text-lg font-semibold text-gray-900">{active.structure}
                  <span className="text-xs text-gray-500 font-normal"> • {active.facility}</span>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setActive(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <Card title="Capacity" subtitle="Adjust (mock)">
                <div className="text-sm text-gray-700">Current: {active.occupied}/{active.capacity}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setActive((r) => (r ? { ...r, occupied: Math.max(0, r.occupied - 10) } : r))}
                  >
                    -10
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setActive((r) => (r ? { ...r, occupied: r.occupied + 10 } : r))}
                  >
                    +10
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                    onClick={() => alert('MVP: Persist capacity change (mock)')}
                  >
                    Save changes
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">MVP: This simulates moving plants between structures.</div>
              </Card>
        <Card title="Sites & structures" subtitle="Manage (mock)">
                <div className="space-y-3 text-sm">
                  {/* Sites editor */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Sites</div>
                    <ul className="space-y-1">
          {activeLicensee!.sites.map((s, idx) => (
                        <li key={s+idx} className="flex items-center gap-2">
                          <input className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" value={s}
                            onChange={(e)=>{
                              const v=e.target.value; setActiveLicensee(al=>al?{...al, sites: al.sites.map((x,i)=>i===idx?v:x)}:al);
            setLicensees(prev=>prev.map(l=>l.id===activeLicensee!.id?{...l, sites: l.sites.map((x,i)=>i===idx?v:x)}:l));
                            }} />
                          <button className="text-xs text-rose-600 hover:underline" onClick={()=>{
                            setActiveLicensee(al=>al?{...al, sites: al.sites.filter((_,i)=>i!==idx)}:al);
          setLicensees(prev=>prev.map(l=>l.id===activeLicensee!.id?{...l, sites: l.sites.filter((_,i)=>i!==idx)}:l));
                          }}>Remove</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2">
                      <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={()=>{
      const name=`Site ${activeLicensee!.sites.length+1}`;
                        setActiveLicensee(al=>al?{...al, sites:[...al.sites, name]}:al);
      setLicensees(prev=>prev.map(l=>l.id===activeLicensee!.id?{...l, sites:[...l.sites, name]}:l));
                      }}>Add site</button>
                    </div>
                  </div>

                  {/* Structures editor for this facility */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Structures</div>
                    <ul className="space-y-1">
                      {rows.filter(r=>r.facility===activeLicensee!.name).map((r)=> (
                        <li key={r.structureId} className="flex items-center gap-2">
                          <input className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" value={r.structure}
                            onChange={(e)=>{
                              const v=e.target.value; setRows(prev=>prev.map(x=>x.structureId===r.structureId?{...x, structure:v}:x));
                            }} />
                          <input type="number" min={0} className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm" value={r.capacity}
                            onChange={(e)=>{ const cap = Math.max(0, Number(e.target.value)||0); setRows(prev=>prev.map(x=>x.structureId===r.structureId?{...x, capacity:cap}:x)); }} />
                          <button className="text-xs text-rose-600 hover:underline" onClick={()=> setRows(prev=>prev.filter(x=>x.structureId!==r.structureId))}>Delete</button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={()=>{
                        const id = `st-${Math.random().toString(36).slice(2,8)}`;
                        setRows(prev=>[{ structureId:id, structure:`New Structure ${id.slice(-3)}`, facility: activeLicensee!.name, occupied:0, capacity:10 }, ...prev]);
                      }}>Add structure</button>
                      <div className="text-xs text-gray-500">MVP: Changes are local to this session.</div>
                    </div>
                  </div>
                </div>
              </Card>
              <Card title="Move plants" subtitle="Simulate transfer (mock)">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={25} min={1} className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm" />
                  <MoveRight className="h-4 w-4 text-gray-500" aria-hidden />
                  <select className="rounded-md border border-gray-300 px-2 py-1 text-sm">
                    {Object.keys(grouped).map((fac) => (
                      <optgroup key={fac} label={fac}>
                        {(grouped[fac] || []).map((r) => (
                          <option key={r.structureId} value={r.structureId}>{r.structure}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button className="rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Apply</button>
                </div>
                <div className="mt-2 text-xs text-gray-500">MVP: This would create a transfer within the facility.</div>
              </Card>
              <Card title="Alerts" subtitle="Derived from utilization (mock)">
                <ul className="mt-1 space-y-2 text-sm text-gray-700">
                  <li className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden /> Low utilization warning if below 30%</li>
                  <li className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden /> Over capacity triggers inspection</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: licensee details */}
      {activeLicensee && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setActiveLicensee(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[30rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
            <div className="p-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">License holder</div>
                <div className="text-lg font-semibold text-gray-900">
                  {activeLicensee.name}
                  <span className="text-xs text-gray-500 font-normal"> • {activeLicensee.licenceId}</span>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setActiveLicensee(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <Card title="Summary">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2"><Scale className="h-4 w-4 text-emerald-600" aria-hidden /> Class: {activeLicensee.class}</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" aria-hidden /> District: {activeLicensee.district}</li>
                  <li className="flex items-center gap-2"><User2 className="h-4 w-4 text-emerald-600" aria-hidden /> Status: {activeLicensee.status}</li>
                  <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" aria-hidden /> Licence: {activeLicensee.licenceId} • Expires {new Date(activeLicensee.licenceExpiry).toLocaleDateString()}</li>
                  <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden /> Risk: {activeLicensee.risk} • Alerts: {activeLicensee.alerts} • Investigations: {activeLicensee.investigations}</li>
                </ul>
              </Card>
              <Card title="Compliance & inspections">
                <div className="text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Compliance score</span>
                    <span className="font-medium">{activeLicensee.complianceScore}%</span>
                  </div>
                  <Progress value={activeLicensee.complianceScore} max={100} scheme="good-high" />
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 p-2"><div className="text-gray-500">Last inspection</div><div className="font-medium">{activeLicensee.lastInspection?new Date(activeLicensee.lastInspection).toLocaleDateString():'—'}</div></div>
                    <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 p-2"><div className="text-gray-500">Next inspection</div><div className="font-medium">{activeLicensee.nextInspection?new Date(activeLicensee.nextInspection).toLocaleDateString():'—'}</div></div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md ring-1 ring-gray-300 px-3 py-2 text-sm hover:bg-gray-50"><ShieldCheck className="h-4 w-4"/> Schedule</button>
                    {activeLicensee.status==='Suspended' ? (
                      <button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:opacity-95" onClick={()=>updateStatus(activeLicensee.id,'Active')}>Reinstate</button>
                    ) : (
                      <button className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:opacity-95" onClick={()=>updateStatus(activeLicensee.id,'Suspended')}>Suspend</button>
                    )}
                  </div>
                </div>
              </Card>
              <Card title="Inventory & COAs">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Plants in system: <span className="font-medium">{activeLicensee.plants.toLocaleString()}</span></li>
                  <li>Batches in progress: <span className="font-medium">{activeLicensee.batches}</span></li>
                  <li>Retail products: <span className="font-medium">{activeLicensee.products}</span></li>
                  <li>COA pass rate: <span className="font-medium">{activeLicensee.coaPassRate}%</span></li>
                </ul>
              </Card>
              <Card title="Portal account">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">Reset the applicant portal password and share credentials.</div>
                    {accountCreds ? (
                      <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setAccountCreds({ username: generateUsername(activeLicensee.name), password: generatePassword(12) })}><RefreshCcw className="h-3.5 w-3.5"/> Regenerate</button>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary ring-1 ring-primary/30 px-2 py-1 text-xs hover:bg-primary/15" onClick={() => setAccountCreds({ username: generateUsername(activeLicensee.name), password: generatePassword(12) })}>Reset password</button>
                    )}
                  </div>
                  {accountCreds && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">Username</div>
                        <div className="mt-1 font-mono text-sm text-gray-900 break-all">{accountCreds.username}</div>
                        <button className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={() => copyToClipboard(accountCreds.username)}><Copy className="h-3.5 w-3.5"/> Copy</button>
                      </div>
                      <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide text-gray-500">Temporary password</div>
                        <div className="mt-1 font-mono text-sm text-gray-900 break-all">{accountCreds.password}</div>
                        <button className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={() => copyToClipboard(accountCreds.password)}><Copy className="h-3.5 w-3.5"/> Copy</button>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => window.print()}><Printer className="h-3.5 w-3.5"/> Print credentials</button>
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50" disabled={!activeLicensee.contactEmail} onClick={() => alert(`Mock: Sent credentials to ${activeLicensee.contactEmail || '—'}`)}><Mail className="h-3.5 w-3.5"/> Send via email</button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              <Card title="Sites" subtitle={`${activeLicensee.sites.length} site(s)`}>
                <ul className="text-sm text-gray-700 space-y-1">
                  {activeLicensee.sites.map(s => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-600" aria-hidden /> {s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              {/* Structures card below Sites */}
              <Card title="Structures" subtitle={`${rows.filter(r => r.facility === activeLicensee.name).length} structure(s)`}>
                <ul className="text-sm text-gray-700 space-y-1">
                  {rows.filter(r => r.facility === activeLicensee.name).map(r => (
                    <li key={r.structureId} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600" aria-hidden />
                        <span>{r.structure}</span>
                        <span className="text-xs text-gray-500">{r.occupied}/{r.capacity}</span>
                      </span>
                      <button
                        className="text-primary text-xs hover:underline"
                        onClick={() => {
                          setActive(r);
                          setActiveLicensee(null);
                        }}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Documents">
                <ul className="text-sm text-gray-700 space-y-1">
                  {[
                    { id: 'DOC-001', name: 'License Certificate', date: '2025-06-30' },
                    { id: 'DOC-002', name: 'Insurance Proof', date: '2025-07-10' },
                  ].map(d => (
                    <li key={d.id} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" aria-hidden /> {d.name}</span>
                      <span className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = 'gray' }: { label: string; value: number | string; tone?: 'gray' | 'emerald' | 'amber' | 'rose' }) {
  const toneMap: Record<string, string> = {
    gray: 'text-gray-700 bg-gray-50 ring-gray-200',
    emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    amber: 'text-amber-700 bg-amber-50 ring-amber-200',
    rose: 'text-rose-700 bg-rose-50 ring-rose-200',
  };
  return (
    <div className={`rounded-md px-2 py-1 ring-1 ${toneMap[tone]}`}>
      <div className="text-[11px] leading-tight">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function Progress({ value, max, scheme }: { value: number; max: number; scheme?: 'default' | 'good-high' }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  let tone = 'bg-emerald-500';
  if (scheme === 'good-high') {
    // 0-30 => red, 31-69 => amber, 70-100 => green
    if (pct <= 30) tone = 'bg-rose-500';
    else if (pct < 70) tone = 'bg-amber-500';
    else tone = 'bg-emerald-500';
  } else {
    if (pct >= 100) tone = 'bg-rose-500';
    else if (pct >= 70) tone = 'bg-amber-500';
  }
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
      <div className={`${tone} h-2`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Badge({ label, tone = 'gray' }: { label: string; tone?: 'gray' | 'emerald' | 'amber' | 'rose' }) {
  const toneMap: Record<string, string> = {
    gray: 'text-gray-700 bg-gray-50 ring-gray-200',
    emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    amber: 'text-amber-700 bg-amber-50 ring-amber-200',
    rose: 'text-rose-700 bg-rose-50 ring-rose-200',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ${toneMap[tone]}`}>{label}</span>;
}

function daysFromNow(n: number): string {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString();
}

function generateUsername(name: string): string {
  const base = (name || 'operator')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 12) || 'operator';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

function generatePassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const useCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
  const arr = useCrypto ? new Uint32Array(length) : undefined;
  if (arr) crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) {
    const idx = arr ? arr[i]! % alphabet.length : Math.floor(Math.random() * alphabet.length);
    out += alphabet[idx];
  }
  return out;
}

async function copyToClipboard(text: string) {
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    alert('Copied to clipboard');
  } catch (e) {
    alert('Copy failed');
  }
}
