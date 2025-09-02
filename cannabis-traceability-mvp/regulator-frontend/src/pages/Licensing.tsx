import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { Scale, MapPin, CheckCircle2, XCircle, Clock, ShieldCheck, Users, BadgeInfo, Calendar as CalendarIcon, Filter, Search as SearchIcon, Copy, Mail, Printer, RefreshCcw } from 'lucide-react';

type LicenceClass = 'Cultivation' | 'Manufacturing' | 'Laboratory' | 'Retail/Dispensary';
type AppStatus = 'New' | 'Screening' | 'Background Checks' | 'Pending Docs' | 'Inspection Scheduled' | 'Decision Ready' | 'Approved' | 'Rejected';

type Application = {
  id: string;
  applicant: string;
  licenceClass: LicenceClass;
  district: string;
  sites?: string[];
  structures?: Array<{ site: string; name: string; capacity?: number }>;
  submittedAt: string;
  status: AppStatus;
  slaDaysLeft: number; // positive = days remaining, negative = overdue
  risk: 'Low' | 'Medium' | 'High';
};

const seedApplications: Application[] = [
  { id: 'A-24051', applicant: 'Green Leaf Holdings', licenceClass: 'Cultivation', district: 'Castries', submittedAt: daysAgo(12), status: 'Background Checks', slaDaysLeft: 18, risk: 'Medium' },
  { id: 'A-24052', applicant: 'Medicanna Labs Ltd', licenceClass: 'Laboratory', district: 'Gros Islet', submittedAt: daysAgo(5), status: 'Screening', slaDaysLeft: 25, risk: 'Low' },
  { id: 'A-24053', applicant: 'Sunrise Processing', licenceClass: 'Manufacturing', district: 'Vieux Fort', submittedAt: daysAgo(22), status: 'Pending Docs', slaDaysLeft: -2, risk: 'High' },
  { id: 'A-24054', applicant: 'Harbor Dispensary', licenceClass: 'Retail/Dispensary', district: 'Soufrière', submittedAt: daysAgo(9), status: 'Inspection Scheduled', slaDaysLeft: 11, risk: 'Medium' },
  { id: 'A-24055', applicant: 'West Ridge Farm', licenceClass: 'Cultivation', district: 'Dennery', submittedAt: daysAgo(31), status: 'Decision Ready', slaDaysLeft: -1, risk: 'Low' },
  { id: 'A-24056', applicant: 'Island Wellness Retail', licenceClass: 'Retail/Dispensary', district: 'Castries', submittedAt: daysAgo(3), status: 'New', slaDaysLeft: 30, risk: 'Low' },
  { id: 'A-24057', applicant: 'Blue Mountain Growers', licenceClass: 'Cultivation', district: 'Choiseul', submittedAt: daysAgo(15), status: 'Screening', slaDaysLeft: 20, risk: 'Medium' },
  { id: 'A-24058', applicant: 'Carib Extracts', licenceClass: 'Manufacturing', district: 'Vieux Fort', submittedAt: daysAgo(28), status: 'Decision Ready', slaDaysLeft: 2, risk: 'Medium' },
  { id: 'A-24059', applicant: 'Seaview Labs', licenceClass: 'Laboratory', district: 'Gros Islet', submittedAt: daysAgo(7), status: 'Pending Docs', slaDaysLeft: 10, risk: 'Medium' },
  { id: 'A-24060', applicant: 'South Coast Dispensary', licenceClass: 'Retail/Dispensary', district: 'Laborie', submittedAt: daysAgo(40), status: 'Rejected', slaDaysLeft: -5, risk: 'High' },
  { id: 'A-24061', applicant: 'Highland Organics', licenceClass: 'Cultivation', district: 'Soufrière', submittedAt: daysAgo(18), status: 'Inspection Scheduled', slaDaysLeft: 9, risk: 'Low' },
  { id: 'A-24062', applicant: 'Emerald Valley Farm', licenceClass: 'Cultivation', district: 'Anse la Raye', submittedAt: daysAgo(11), status: 'Background Checks', slaDaysLeft: 17, risk: 'Medium' },
  { id: 'A-24063', applicant: 'PureCare Processing', licenceClass: 'Manufacturing', district: 'Castries', submittedAt: daysAgo(23), status: 'Pending Docs', slaDaysLeft: -1, risk: 'High' },
  { id: 'A-24064', applicant: 'Northern Lights Lab', licenceClass: 'Laboratory', district: 'Gros Islet', submittedAt: daysAgo(6), status: 'Screening', slaDaysLeft: 26, risk: 'Low' },
  { id: 'A-24065', applicant: 'Island Roots', licenceClass: 'Cultivation', district: 'Dennery', submittedAt: daysAgo(19), status: 'New', slaDaysLeft: 29, risk: 'Low' },
  { id: 'A-24066', applicant: 'Harbor Wellness', licenceClass: 'Retail/Dispensary', district: 'Soufrière', submittedAt: daysAgo(13), status: 'Decision Ready', slaDaysLeft: 1, risk: 'Medium' },
  { id: 'A-24067', applicant: 'Silver Sands Farm', licenceClass: 'Cultivation', district: 'Micoud', submittedAt: daysAgo(9), status: 'Background Checks', slaDaysLeft: 12, risk: 'Medium' },
  { id: 'A-24068', applicant: 'Bayfront Dispensary', licenceClass: 'Retail/Dispensary', district: 'Castries', submittedAt: daysAgo(4), status: 'New', slaDaysLeft: 27, risk: 'Low' },
  { id: 'A-24069', applicant: 'GreenWave Labs', licenceClass: 'Laboratory', district: 'Vieux Fort', submittedAt: daysAgo(21), status: 'Approved', slaDaysLeft: -10, risk: 'Low' },
  { id: 'A-24070', applicant: 'SunCo Manufacturing', licenceClass: 'Manufacturing', district: 'Choiseul', submittedAt: daysAgo(17), status: 'Inspection Scheduled', slaDaysLeft: 8, risk: 'Medium' },
  { id: 'A-24071', applicant: 'Creole Cannabis Co.', licenceClass: 'Cultivation', district: 'Soufrière', submittedAt: daysAgo(26), status: 'Pending Docs', slaDaysLeft: -4, risk: 'High' },
  { id: 'A-24072', applicant: 'Maris Grove Farm', licenceClass: 'Cultivation', district: 'Anse la Raye', submittedAt: daysAgo(8), status: 'Screening', slaDaysLeft: 22, risk: 'Low' },
  { id: 'A-24073', applicant: 'East Ridge Labs', licenceClass: 'Laboratory', district: 'Dennery', submittedAt: daysAgo(14), status: 'Background Checks', slaDaysLeft: 16, risk: 'Medium' },
  { id: 'A-24074', applicant: 'Central Dispensary', licenceClass: 'Retail/Dispensary', district: 'Castries', submittedAt: daysAgo(2), status: 'New', slaDaysLeft: 30, risk: 'Low' },
  { id: 'A-24075', applicant: 'Blue Bay Botanicals', licenceClass: 'Manufacturing', district: 'Laborie', submittedAt: daysAgo(29), status: 'Decision Ready', slaDaysLeft: -2, risk: 'Medium' },
  { id: 'A-24076', applicant: 'Windward Wellness', licenceClass: 'Retail/Dispensary', district: 'Gros Islet', submittedAt: daysAgo(10), status: 'Inspection Scheduled', slaDaysLeft: 7, risk: 'Low' },
  { id: 'A-24077', applicant: 'Rainforest Remedies', licenceClass: 'Manufacturing', district: 'Soufrière', submittedAt: daysAgo(12), status: 'Screening', slaDaysLeft: 20, risk: 'Medium' },
  { id: 'A-24078', applicant: 'Saint Lucia Extracts', licenceClass: 'Manufacturing', district: 'Castries', submittedAt: daysAgo(24), status: 'Pending Docs', slaDaysLeft: -3, risk: 'High' },
  { id: 'A-24079', applicant: 'GreenWave Labs', licenceClass: 'Laboratory', district: 'Vieux Fort', submittedAt: daysAgo(16), status: 'Approved', slaDaysLeft: -9, risk: 'Low' },
  { id: 'A-24080', applicant: 'Coral Reef Dispensary', licenceClass: 'Retail/Dispensary', district: 'Choiseul', submittedAt: daysAgo(5), status: 'New', slaDaysLeft: 28, risk: 'Low' },
];

function daysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString();
}

export default function Licensing() {
  const [apps, setApps] = useState<Application[]>(seedApplications);
  const [q, setQ] = useState('');
  const [cls, setCls] = useState<'all' | LicenceClass>('all');
  const [status, setStatus] = useState<'all' | AppStatus>('all');
  const [district, setDistrict] = useState<'all' | string>('all');
  const [risk, setRisk] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [active, setActive] = useState<Application | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    applicant: '',
    licenceClass: '' as '' | LicenceClass,
    district: '' as '' | string,
    site: '',
  sites: [] as string[],
  structures: [] as Array<{ site: string; name: string; capacity?: number }>,
    contactName: '',
    contactEmail: ''
  });
  const [formTouched, setFormTouched] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);

  const classes = ['Cultivation','Manufacturing','Laboratory','Retail/Dispensary'] as const;
  const statuses = ['New','Screening','Background Checks','Pending Docs','Inspection Scheduled','Decision Ready','Approved','Rejected'] as const;
  const allDistricts = ['Castries','Gros Islet','Vieux Fort','Soufrière','Dennery','Laborie','Choiseul','Micoud','Anse la Raye'] as const;
  const districts = Array.from(new Set(apps.map(a => a.district)));
  const risks = ['Low','Medium','High'] as const;

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const matchesQ = !q.trim() || `${a.id} ${a.applicant} ${a.licenceClass} ${a.district}`.toLowerCase().includes(q.toLowerCase());
      const matchesC = cls === 'all' || a.licenceClass === cls;
      const matchesS = status === 'all' || a.status === status;
      const matchesD = district === 'all' || a.district === district;
      const matchesR = risk === 'all' || a.risk === risk;
      return matchesQ && matchesC && matchesS && matchesD && matchesR;
    });
  }, [apps, q, cls, status, district, risk]);

  const counters = useMemo(() => {
    const by = (s: AppStatus) => apps.filter(a => a.status === s).length;
    return {
      new: by('New'),
      screening: by('Screening'),
      bg: by('Background Checks'),
      docs: by('Pending Docs'),
      insp: by('Inspection Scheduled'),
      ready: by('Decision Ready'),
      approved: by('Approved'),
      rejected: by('Rejected')
    };
  }, [apps]);

  const setStatusFor = (id: string, s: AppStatus) => setApps(prev => prev.map(a => a.id === id ? { ...a, status: s } : a));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2"><Scale className="h-5 w-5 text-emerald-600" aria-hidden /> Licensing</h1>

      {/* Pipeline snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <MiniKpi label="New" value={counters.new} tone="gray" />
        <MiniKpi label="Screening" value={counters.screening} tone="gray" />
        <MiniKpi label="Background" value={counters.bg} tone="amber" />
        <MiniKpi label="Pending docs" value={counters.docs} tone="amber" />
        <MiniKpi label="Inspection" value={counters.insp} tone="blue" />
        <MiniKpi label="Decision" value={counters.ready} tone="blue" />
        <MiniKpi label="Approved" value={counters.approved} tone="emerald" />
        <MiniKpi label="Rejected" value={counters.rejected} tone="rose" />
      </div>

      {/* Applications full width with integrated filters */}
      <Card title="Applications" subtitle={`${filtered.length} items`}>
        <div className="mb-2 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            onClick={() => { setFormTouched(false); setForm({ applicant: '', licenceClass: '', district: '', site: '', sites: [], structures: [], contactName: '', contactEmail: '' }); setCreateOpen(true); }}
          >
            <Scale className="h-4 w-4" aria-hidden /> New application
          </button>
        </div>
          <div className="overflow-auto max-h-[48rem] rounded-lg border border-gray-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 sticky top-0 z-10">
                  <th className="py-2 pr-3 font-semibold">Applicant</th>
                  <th className="py-2 pr-3 font-semibold">Class</th>
                  <th className="py-2 pr-3 font-semibold">District</th>
                  <th className="py-2 pr-3 font-semibold">Submitted</th>
                  <th className="py-2 pr-3 font-semibold">SLA</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Risk</th>
                  <th className="py-2 pr-3 font-semibold">Actions</th>
                </tr>
                <tr className="bg-white border-b border-gray-100 text-xs">
                  <th className="py-1 pr-3">
                    <input
                      value={q}
                      onChange={(e)=>setQ(e.target.value)}
                      placeholder="Search applicant or ID"
                      className="w-full rounded-md border border-gray-300 px-2 py-1"
                    />
                  </th>
                  <th className="py-1 pr-3">
                    <select value={cls} onChange={(e)=>setCls(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                      <option value="all">All</option>
                      {classes.map(c=> (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </th>
                  <th className="py-1 pr-3">
                    <select value={district} onChange={(e)=>setDistrict(e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                      <option value="all">All</option>
                      {districts.map(d=> (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </th>
                  <th className="py-1 pr-3"></th>
                  <th className="py-1 pr-3"></th>
                  <th className="py-1 pr-3">
                    <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                      <option value="all">All</option>
                      {statuses.map(s=> (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </th>
                  <th className="py-1 pr-3">
                    <select value={risk} onChange={(e)=>setRisk(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-2 py-1">
                      <option value="all">All</option>
                      {risks.map(r=> (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </th>
                  <th className="py-1 pr-3">
                    {(q || cls !== 'all' || status !== 'all' || district !== 'all' || risk !== 'all') && (
                      <button type="button" className="w-full rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50" onClick={()=>{ setQ(''); setCls('all'); setStatus('all'); setDistrict('all'); setRisk('all'); }}>Clear</button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-gray-900">{a.applicant}</div>
                      <div className="text-xs text-gray-500">{a.id}</div>
                    </td>
                    <td className="py-2 pr-3">{a.licenceClass}</td>
                    <td className="py-2 pr-3">{a.district}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(a.submittedAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs font-medium ${a.slaDaysLeft < 0 ? 'text-rose-700' : a.slaDaysLeft <= 5 ? 'text-amber-700' : 'text-gray-700'}`}>{a.slaDaysLeft}d</span>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge label={a.status} tone={badgeTone(a.status)} />
                    </td>
                    <td className="py-2 pr-3">
                      <Badge label={a.risk} tone={a.risk === 'High' ? 'rose' : a.risk === 'Medium' ? 'amber' : 'emerald'} />
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-md ring-1 ring-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          onClick={() => setActive(a)}
                        >
                          View
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary ring-1 ring-primary/30 px-2 py-1 text-xs hover:bg-primary/15"
                          onClick={() => alert(`MVP: Requested info from ${a.applicant}`)}
                        >
                          <BadgeInfo className="h-3.5 w-3.5" aria-hidden />
                          Request info
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

  {/* Removed register and permits cards per request */}

      {/* Drawer - Application details */}
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setActive(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[36rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
            <div className="p-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Application</div>
                <div className="text-lg font-semibold text-gray-900">{active.applicant} <span className="text-xs text-gray-500 font-normal">({active.id})</span></div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setActive(null)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <Card title="Summary" subtitle="Class, location, timing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Field label="Licence class" value={active.licenceClass} icon={<Scale className="h-4 w-4 text-emerald-600" aria-hidden />} />
                  <Field label="District" value={active.district} icon={<MapPin className="h-4 w-4 text-emerald-600" aria-hidden />} />
                  <Field label="Submitted" value={new Date(active.submittedAt).toLocaleString()} icon={<Clock className="h-4 w-4 text-emerald-600" aria-hidden />} />
                  <Field label="SLA remaining" value={`${active.slaDaysLeft} days`} icon={<BadgeInfo className="h-4 w-4 text-emerald-600" aria-hidden />} />
                </div>
              </Card>

              <Card title="Ownership & officers" subtitle="Fit-and-proper checks (mock)">
                <div className="space-y-2 text-sm">
                  {[
                    { name: 'Jane Doe', role: 'Director', share: '40%' },
                    { name: 'John Smith', role: 'Director', share: '35%' },
                    { name: 'Aisha Pierre', role: 'Compliance Officer', share: '—' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                      <div className="inline-flex items-center gap-2 text-gray-800">
                        <Users className="h-4 w-4 text-emerald-600" aria-hidden />
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-gray-500">{p.role}</span>
                      </div>
                      <span className="text-xs text-gray-500">{p.share}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500">MVP: Background vetting recorded as completed/clearance on decision.</div>
                </div>
              </Card>

              <Card title="Documents" subtitle="Required uploads (mock)">
                <ul className="mt-1 space-y-2 text-sm text-gray-700">
                  {[
                    { name: 'Site plan (scaled)', required: true, present: active.id !== 'A-24053' },
                    { name: 'Security plan', required: true, present: true },
                    { name: 'SOPs (operations)', required: true, present: true },
                    { name: 'QA/QC plan (labs/manufacturing)', required: active.licenceClass !== 'Retail/Dispensary', present: true },
                    { name: 'Proof of premises', required: true, present: true },
                  ].map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        {d.present ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600" aria-hidden />
                        )}
                        <span>{d.name}</span>
                        {d.required && <span className="text-[11px] text-amber-700">required</span>}
                      </div>
                      <button className="text-sm text-primary hover:underline" onClick={() => alert('MVP: Upload dialog (mock)')}>{d.present ? 'Replace' : 'Upload'}</button>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Pre-licensing inspection" subtitle="Schedule & record outcome (mock)">
                <div className="flex items-center justify-between text-sm">
                  <div className="inline-flex items-center gap-2 text-gray-800">
                    <CalendarIcon className="h-4 w-4 text-emerald-600" aria-hidden />
                    <span>Inspection</span>
                  </div>
                  <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setStatusFor(active.id, 'Inspection Scheduled')}>Schedule</button>
                </div>
                <div className="mt-2 text-xs text-gray-500">MVP: Selecting schedule adds to Calendar and updates status.</div>
              </Card>

              <Card title="Decision" subtitle="Issue with conditions (mock)">
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4" /> Security controls verified</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4" /> Record keeping adequate</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Environmental permits provided</label>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Product stewardship plan</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:opacity-95" onClick={() => { setStatusFor(active.id, 'Approved'); alert('MVP: Licence issued (mock)'); }}>
                      <ShieldCheck className="h-4 w-4" aria-hidden /> Approve & issue
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:opacity-95" onClick={() => { setStatusFor(active.id, 'Rejected'); alert('MVP: Application rejected (mock)'); }}>
                      <XCircle className="h-4 w-4" aria-hidden /> Reject
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Drawer - Create new application */}
      {createOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setCreateOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[36rem] bg-white shadow-xl border-l border-gray-200 overflow-auto">
            <div className="p-4 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">New application</div>
                <div className="text-lg font-semibold text-gray-900">Create licensing application</div>
              </div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setCreateOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <Card title="Applicant details" subtitle="Entity and contacts">
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Applicant name<span className="text-rose-600">*</span></label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g., Green Leaf Holdings Inc."
                      value={form.applicant}
                      onChange={(e) => setForm(v => ({ ...v, applicant: e.target.value }))}
                    />
                    {formTouched && !form.applicant.trim() && (<div className="mt-1 text-xs text-rose-600">Applicant name is required.</div>)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Licence class<span className="text-rose-600">*</span></label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={form.licenceClass}
                        onChange={(e) => setForm(v => ({ ...v, licenceClass: e.target.value as LicenceClass }))}
                      >
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {formTouched && !form.licenceClass && (<div className="mt-1 text-xs text-rose-600">Licence class is required.</div>)}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">District<span className="text-rose-600">*</span></label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={form.district}
                        onChange={(e) => setForm(v => ({ ...v, district: e.target.value }))}
                      >
                        <option value="">Select district</option>
                        {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {formTouched && !form.district && (<div className="mt-1 text-xs text-rose-600">District is required.</div>)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Site address</label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g., Lot 12, Beausejour, Gros Islet"
                      value={form.site}
                      onChange={(e) => setForm(v => ({ ...v, site: e.target.value }))}
                    />
                  </div>
                  <Card title="Sites & structures" subtitle="Planned operational footprint">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Sites</div>
                        <ul className="space-y-1">
                          {form.sites.map((s, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <input className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" value={s} onChange={(e)=>setForm(v=>({ ...v, sites: v.sites.map((x,i)=>i===idx?e.target.value:x) }))} />
                              <button className="text-xs text-rose-600 hover:underline" onClick={()=>setForm(v=>({ ...v, sites: v.sites.filter((_,i)=>i!==idx) }))}>Remove</button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2">
                          <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={()=>setForm(v=>({ ...v, sites: [...v.sites, `Site ${v.sites.length+1}`] }))}>Add site</button>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Structures <span className="ml-1 text-[11px] text-gray-400">(Capacity = maximum plants/units for that structure)</span></div>
                        <ul className="space-y-1">
                          {form.structures.map((st, idx) => (
                            <li key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <select className="col-span-5 rounded-md border border-gray-300 px-2 py-1 text-sm" value={st.site} onChange={(e)=>setForm(v=>({ ...v, structures: v.structures.map((x,i)=>i===idx?{ ...x, site:e.target.value }:x) }))}>
                                <option value="">Select site</option>
                                {form.sites.map(s=> <option key={s} value={s}>{s}</option>)}
                              </select>
                              <input className="col-span-5 rounded-md border border-gray-300 px-2 py-1 text-sm" placeholder="Structure name" value={st.name} onChange={(e)=>setForm(v=>({ ...v, structures: v.structures.map((x,i)=>i===idx?{ ...x, name:e.target.value }:x) }))} />
                              <input type="number" min={0} className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm" placeholder="Cap." value={st.capacity ?? ''} onChange={(e)=>setForm(v=>({ ...v, structures: v.structures.map((x,i)=>i===idx?{ ...x, capacity: Math.max(0, Number(e.target.value)||0) }:x) }))} />
                              <button className="col-span-12 text-left text-xs text-rose-600 hover:underline" onClick={()=>setForm(v=>({ ...v, structures: v.structures.filter((_,i)=>i!==idx) }))}>Remove</button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2">
                          <button className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={()=>setForm(v=>({ ...v, structures: [...v.structures, { site: v.sites[0] ?? '', name: `Structure ${v.structures.length+1}`, capacity: 10 }] }))}>Add structure</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Primary contact</label>
                      <input
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="e.g., Jane Doe"
                        value={form.contactName}
                        onChange={(e) => setForm(v => ({ ...v, contactName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contact email</label>
                      <input
                        type="email"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="e.g., jane@example.com"
                        value={form.contactEmail}
                        onChange={(e) => setForm(v => ({ ...v, contactEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Submission" subtitle="Review and create">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">An application ID will be generated on submit. SLA starts at 30 days.</div>
                  <div className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                        <input type="checkbox" className="h-4 w-4" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                        Create portal account for applicant
                      </label>
                      {createAccount && (
                        <div className="flex items-center gap-2">
                          {creds ? (
                            <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setCreds({ username: generateUsername(form.applicant), password: generatePassword(12) })}><RefreshCcw className="h-3.5 w-3.5" /> Regenerate</button>
                          ) : (
                            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 text-primary ring-1 ring-primary/30 px-2 py-1 text-xs hover:bg-primary/15" onClick={() => setCreds({ username: generateUsername(form.applicant), password: generatePassword(12) })}>Generate credentials</button>
                          )}
                        </div>
                      )}
                    </div>

                    {createAccount && creds && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-3 py-2">
                          <div className="text-[11px] uppercase tracking-wide text-gray-500">Username</div>
                          <div className="mt-1 font-mono text-sm text-gray-900 break-all">{creds.username || '—'}</div>
                          <button className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={() => copyToClipboard(creds.username)}><Copy className="h-3.5 w-3.5" /> Copy</button>
                        </div>
                        <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-3 py-2">
                          <div className="text-[11px] uppercase tracking-wide text-gray-500">Temporary password</div>
                          <div className="mt-1 font-mono text-sm text-gray-900 break-all">{creds.password}</div>
                          <button className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={() => copyToClipboard(creds.password)}><Copy className="h-3.5 w-3.5" /> Copy</button>
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print credentials</button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                            disabled={!form.contactEmail}
                            onClick={() => alert(`Mock: Sent credentials to ${form.contactEmail || '—'}`)}
                          >
                            <Mail className="h-3.5 w-3.5" /> Send via email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setCreateOpen(false)}
                    >Cancel</button>
                    <button
                      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                      onClick={() => {
                        setFormTouched(true);
                        if (!form.applicant.trim() || !form.licenceClass || !form.district) return;
                        const id = nextId(apps);
                        const risk = defaultRisk(form.licenceClass);
                        const newApp: Application = {
                          id,
                          applicant: form.applicant.trim(),
                          licenceClass: form.licenceClass,
                          district: form.district,
                          sites: form.sites,
                          structures: form.structures,
                          submittedAt: new Date().toISOString(),
                          status: 'New',
                          slaDaysLeft: 30,
                          risk
                        };
                        setApps(prev => [...prev, newApp]);
                        setCreateOpen(false);
                        setActive(newApp);
                      }}
                    >Create & open</button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniKpi({ label, value, tone = 'gray' }: { label: string; value: number | string; tone?: 'gray' | 'emerald' | 'amber' | 'blue' | 'rose' }) {
  const toneMap: Record<string, string> = {
    gray: 'text-gray-700 bg-gray-50 ring-gray-200',
    emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    amber: 'text-amber-700 bg-amber-50 ring-amber-200',
    blue: 'text-blue-700 bg-blue-50 ring-blue-200',
    rose: 'text-rose-700 bg-rose-50 ring-rose-200',
  };
  return (
    <div className={`rounded-md px-2 py-1 ring-1 ${toneMap[tone]}`}>
      <div className="text-[11px] leading-tight">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-gray-900">{value ?? '—'}</div>
      </div>
    </div>
  );
}

function Badge({ label, tone = 'gray' }: { label: string; tone?: 'gray' | 'emerald' | 'amber' | 'blue' | 'rose' }) {
  const toneMap: Record<string, string> = {
    gray: 'text-gray-700 bg-gray-50 ring-gray-200',
    emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
    amber: 'text-amber-700 bg-amber-50 ring-amber-200',
    blue: 'text-blue-700 bg-blue-50 ring-blue-200',
    rose: 'text-rose-700 bg-rose-50 ring-rose-200',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ${toneMap[tone]}`}>{label}</span>;
}

function badgeTone(s: AppStatus): 'gray' | 'emerald' | 'amber' | 'blue' | 'rose' {
  switch (s) {
    case 'Approved': return 'emerald';
    case 'Rejected': return 'rose';
    case 'Background Checks':
    case 'Pending Docs': return 'amber';
    case 'Inspection Scheduled':
    case 'Decision Ready': return 'blue';
    default: return 'gray';
  }
}

function nextId(apps: Application[]): string {
  const nums = apps.map(a => {
    const m = a.id.match(/A-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const next = (Math.max(0, ...nums) + 1).toString().padStart(5, '0');
  return `A-${next}`;
}

function defaultRisk(cls: LicenceClass): 'Low' | 'Medium' | 'High' {
  if (cls === 'Manufacturing' || cls === 'Laboratory') return 'Medium';
  return 'Low';
}

function generateUsername(applicant: string): string {
  const base = (applicant || 'applicant')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 12) || 'applicant';
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
