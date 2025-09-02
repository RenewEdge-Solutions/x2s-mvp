import React, { useMemo } from 'react';
import { UserIcon, AlertTriangle, TrendingUp, CheckCircle, FileText } from 'lucide-react';
import { computeEventsForAuditor, eventColor } from '../lib/calendar';

// Mockup data for KPIs and farms
const kpis = [
  { label: 'Total Farms Audited', value: 18, icon: <FileText className="h-6 w-6 text-blue-500" />, color: 'bg-blue-50' },
  { label: 'Farms with Critical Issues', value: 2, icon: <AlertTriangle className="h-6 w-6 text-red-500" />, color: 'bg-red-50' },
  { label: 'Compliant Farms', value: 14, icon: <CheckCircle className="h-6 w-6 text-green-500" />, color: 'bg-green-50' },
  { label: 'Pending Audits', value: 3, icon: <UserIcon className="h-6 w-6 text-yellow-500" />, color: 'bg-yellow-50' },
  { label: 'Avg. Compliance Score', value: '92%', icon: <TrendingUp className="h-6 w-6 text-purple-500" />, color: 'bg-purple-50' },
];

const farms = [
  {
    name: 'Green Valley',
    owner: 'Alice Farmer',
    lastAudit: '2025-08-10',
    compliance: 98,
    status: 'Compliant',
    critical: false,
  },
  {
    name: 'Sunrise Fields',
    owner: 'Bob Grower',
    lastAudit: '2025-07-15',
    compliance: 68,
    status: 'Critical',
    critical: true,
  },
  {
    name: 'Hempstead',
    owner: 'Carla Hemp',
    lastAudit: '2025-08-01',
    compliance: 91,
    status: 'Compliant',
    critical: false,
  },
  {
    name: 'Riverbend',
    owner: 'David Fields',
    lastAudit: '2025-06-30',
    compliance: 74,
    status: 'Critical',
    critical: true,
  },
];

const recentActivity = [
  { date: '2025-08-30', farm: 'Green Valley', action: 'Audit Completed', status: 'Pass' },
  { date: '2025-08-28', farm: 'Sunrise Fields', action: 'Critical Issue Found', status: 'Fail' },
  { date: '2025-08-25', farm: 'Hempstead', action: 'Compliance Review', status: 'Pass' },
  { date: '2025-08-20', farm: 'Riverbend', action: 'Audit Scheduled', status: 'Pending' },
];

export default function Dashboard() {
  // Upcoming events (match Calendar mock source)
  const upcoming = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const refMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const all = [
      ...computeEventsForAuditor(refMonth),
      ...computeEventsForAuditor(nextMonth),
    ];
    return all
      .filter((e) => e.date >= startOfToday)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
  <h1 className="text-2xl font-bold mb-6">Farmer Dashboard – Cannabis Farms</h1>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-4 flex items-center gap-4 shadow-sm border ${kpi.color}`}>
            <div>{kpi.icon}</div>
            <div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-xs text-gray-600">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Farm Compliance Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Farm Compliance Overview</h2>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Farm</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Last Audit</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Compliance</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm.name} className={farm.critical ? 'bg-red-50 border-l-4 border-red-500' : ''}>
                  <td className="px-4 py-2 font-medium">{farm.name}</td>
                  <td className="px-4 py-2">{farm.owner}</td>
                  <td className="px-4 py-2">{farm.lastAudit}</td>
                  <td className="px-4 py-2">{farm.compliance}%</td>
                  <td className="px-4 py-2">
                    {farm.critical ? (
                      <span className="inline-block px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded">Critical</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Compliant</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Auditor Events (syncs with Calendar mock) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
        <div className="rounded-lg shadow border border-gray-200 bg-white">
          {upcoming.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No upcoming events.</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
              {upcoming.map((ev, idx) => (
                <li key={idx} className="p-3 flex items-start gap-3">
                  <span className={`mt-1 inline-block w-2.5 h-2.5 rounded-full ${eventColor(ev.type)}`} aria-hidden />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{ev.label}</div>
                    <div className="text-xs text-gray-600">{ev.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    {ev.description && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Audit Activity</h2>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Farm</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">{item.farm}</td>
                  <td className="px-4 py-2">{item.action}</td>
                  <td className="px-4 py-2">
                    {item.status === 'Pass' && <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">Pass</span>}
                    {item.status === 'Fail' && <span className="inline-block px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded">Fail</span>}
                    {item.status === 'Pending' && <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
