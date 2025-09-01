import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Scissors, Leaf, Package2, DollarSign, FlipHorizontal2, ArrowRightLeft } from 'lucide-react';
import KPI from '../components/KPI';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import AlcoholDashboard from './AlcoholDashboard';
import MushroomsDashboard from './MushroomsDashboard';
import ExplosivesDashboard from './ExplosivesDashboard';
import { computeEventsForCannabis, nextNDays, eventColor } from '../lib/calendar';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeModule } = useModule();
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  type PeriodKey = '24h' | '7d' | '1m' | '3m' | '6m' | 'ytd' | 'ly' | 'yby';
  const [soldPeriod, setSoldPeriod] = useState<PeriodKey>('1m');
  const [revenuePeriod, setRevenuePeriod] = useState<PeriodKey>('1m');

  useEffect(() => {
    if (activeModule === 'cannabis') {
      api.getPlants().then(setPlants).catch(() => setPlants([]));
      api.getHarvests().then(setHarvests).catch(() => setHarvests([]));
      api.getAllOccupancy().then(setOccupancyData).catch(() => setOccupancyData([]));
      loadEvents();
    } else {
      setPlants([]);
      setHarvests([]);
      setOccupancyData([]);
      setCustomEvents([]);
    }
  }, [activeModule]);

  const loadEvents = async () => {
    try {
      const events = await api.getEvents();
      setCustomEvents(Array.isArray(events) ? events : []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setCustomEvents([]);
    }
  };

  const ageInDays = (d: string | Date) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  const getRange = (key: PeriodKey) => {
    const now = new Date();
    const startOfYear = (y: number) => new Date(y, 0, 1);
    const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
    const earliest = new Date(2025, 0, 1);
    let from: Date;
    let to: Date = now;
    switch (key) {
      case '24h':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        from = addMonths(now, -1);
        break;
      case '3m':
        from = addMonths(now, -3);
        break;
      case '6m':
        from = addMonths(now, -6);
        break;
      case 'ytd':
        from = startOfYear(now.getFullYear());
        break;
      case 'ly':
        from = startOfYear(now.getFullYear() - 1);
        to = startOfYear(now.getFullYear());
        break;
      case 'yby':
        from = startOfYear(now.getFullYear() - 2);
        to = startOfYear(now.getFullYear() - 1);
        break;
    }
    if (to < earliest) return { from: earliest, to: earliest };
    if (from < earliest) from = earliest;
    return { from, to };
  };

  // HARDCODED KPI MOCKUP VALUES FOR UI DEMO
  const kpis = useMemo(() => ({
    activePlants: 42,
    veg: 18,
    flower: 24,
    dryingCount: 2,
    storageGrams: 2450,
    harvestedPlantsCount: 39,
    soldGramsInPeriod: 1800,
    estRevenue: 10800,
    alerts: 3,
    totalCapacity: 89,
    totalOccupied: 64,
    emptyStructures: 3,
    capacityUtilization: 72,
  }), []);

  const shortcuts = useMemo(() => {
    type Btn = { label: string; to: string; icon: React.ReactNode; tone?: 'danger' | 'warn' | 'neutral' };
    if (activeModule !== 'cannabis') return [] as Btn[];

    const siteOf = (loc?: string) => (loc ? (loc.includes(' - ') ? loc.split(' - ')[0] : loc) : 'Facility');
    const bySiteCounts = (items: any[], getLoc: (x: any) => string) => {
      const counts: Record<string, number> = {};
      for (const i of items) {
        const s = siteOf(getLoc(i));
        counts[s] = (counts[s] || 0) + 1;
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    };

    const plantById = new Map(plants.map((p) => [p.id, p]));
  const readyForHarvest = plants.filter((p) => !p.harvested && ageInDays(p.plantedAt) >= 60);
  const soonHarvest = plants.filter((p) => !p.harvested && ageInDays(p.plantedAt) >= 57 && ageInDays(p.plantedAt) < 60);
  const flipCandidates = plants.filter((p) => !p.harvested && ageInDays(p.plantedAt) >= 14 && ageInDays(p.plantedAt) < 30);
  const soonFlip = plants.filter((p) => !p.harvested && ageInDays(p.plantedAt) >= 11 && ageInDays(p.plantedAt) < 14);
    const transplantCandidates = plants.filter((p) => siteOf(p.location).startsWith('Indoor Room') && !p.harvested && ageInDays(p.plantedAt) >= 10 && ageInDays(p.plantedAt) < 25);
    const dryingHarvests = harvests.filter((h) => h.status === 'drying');

    const out: Btn[] = [];

    // CRITICAL ACTIONS FIRST (danger tone)
    
    // Pending harvest by top sites (highest priority)
    for (const [site, count] of bySiteCounts(readyForHarvest, (p) => p.location).slice(0, 4)) {
      out.push({ label: `Harvest ${site}` /* was: (${count}) */, to: '/wizard?step=2', icon: <Scissors className="h-4 w-4" aria-hidden />, tone: 'danger' });
    }

    // Flip candidates by site (time-sensitive)
    for (const [site, count] of bySiteCounts(flipCandidates, (p) => p.location).slice(0, 3)) {
      out.push({ label: `Flip plants in ${site}` /* was: (${count}) */, to: '/calendar', icon: <FlipHorizontal2 className="h-4 w-4" aria-hidden />, tone: 'danger' });
    }

    // UPCOMING ACTIONS (warn tone)
    
    // Soon-to-harvest by site
    for (const [site, count] of bySiteCounts(soonHarvest, (p) => p.location).slice(0, 2)) {
      out.push({ label: `Harvest ${site}` /* was: (${count}) */, to: '/wizard?step=2', icon: <Scissors className="h-4 w-4" aria-hidden />, tone: 'warn' });
    }
    
    // Soon-to-flip by site
    for (const [site, count] of bySiteCounts(soonFlip, (p) => p.location).slice(0, 2)) {
      out.push({ label: `Flip plants in ${site}` /* was: (${count}) */, to: '/calendar', icon: <FlipHorizontal2 className="h-4 w-4" aria-hidden />, tone: 'warn' });
    }

    // Drying checks (critical timing)
    const dryingBySite = bySiteCounts(
      dryingHarvests.map((h) => ({ site: siteOf(plantById.get(h.plantId)?.location) })),
      (x) => x.site,
    ).slice(0, 2);
    for (const [site, count] of dryingBySite) {
      out.push({ label: `Check drying in ${site}` /* was: (${count}) */, to: '/inventory', icon: <Scissors className="h-4 w-4" aria-hidden />, tone: 'warn' });
    }

    // SCHEDULED TASKS (neutral tone)
    
    // Transplant suggestions from indoor rooms
    for (const [site, count] of bySiteCounts(transplantCandidates, (p) => p.location).slice(0, 2)) {
      out.push({ label: `Transplant from ${site}` /* was: (${count}) */, to: '/calendar', icon: <ArrowRightLeft className="h-4 w-4" aria-hidden />, tone: 'neutral' });
    }

    // CAPACITY MANAGEMENT (lowest priority)
    
    // Empty structures alerts
    const emptyStructures = occupancyData.flatMap(f => f.structures.filter((s: any) => s.isEmpty));
    for (const structure of emptyStructures.slice(0, 2)) {
      out.push({ 
        label: `Empty ${structure.structureType}: ${structure.structureName}`, 
        to: '/sites', 
        icon: <Package2 className="h-4 w-4" aria-hidden />, 
        tone: 'neutral' 
      });
    }

    return out.slice(0, 10); // cap to 10 as requested to preview crowded UI
  }, [plants, harvests, activeModule, occupancyData]);

  const calendar = useMemo(() => {
    if (activeModule !== 'cannabis') return [] as Array<{ date: Date; items: { label: string; type: any; href?: string }[] }>;
    
    // Get system-generated events
    const systemEvents = computeEventsForCannabis(plants, harvests);
    
    // Get custom events from database and format them
    const customEventsArray = Array.isArray(customEvents) ? customEvents : [];
    const customEventsFormatted = customEventsArray
      .filter(event => event && event.date) // Filter out events without dates
      .map(event => {
        const eventDate = new Date(event.date);
        // Validate that the date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid date for event:', event);
          return null;
        }
        return {
          date: eventDate,
          type: 'custom' as const,
          label: event.title,
          href: `/calendar?eventId=${event.id}`,
          eventId: event.id
        };
      })
      .filter((event): event is { date: Date; type: 'custom'; label: string; href: string; eventId: number } => event !== null);
    
    // Combine system and custom events - we need to cast to handle the union type
    const allEvents = [...systemEvents, ...customEventsFormatted] as Array<{ date: Date; type: any; label: string; href?: string; eventId?: number }>;
    
    // prepare next 14 days; list is scrollable so only ~3 rows are visible
    return nextNDays(allEvents as any, 14);
  }, [plants, harvests, customEvents, activeModule]);

  // Track scroll end for Upcoming list to reveal "Open calendar" only at the end
  const upcomingRef = useRef<HTMLDivElement>(null);
  const [showOpenCalendar, setShowOpenCalendar] = useState(false);
  const onUpcomingScroll = () => {
    const el = upcomingRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2; // tolerance
    setShowOpenCalendar(atBottom);
  };
  useEffect(() => {
    // reset when data/module changes
    setShowOpenCalendar(false);
  }, [calendar.length, activeModule]);

  if (activeModule === 'alcohol') {
    return <AlcoholDashboard />;
  }
  if (activeModule === 'mushrooms') {
    return <MushroomsDashboard />;
  }
  if (activeModule === 'explosives') {
    return <ExplosivesDashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {user?.firstName || user?.lastName ? `${user?.firstName} ${user?.lastName}`.trim() : user?.username}
      </h1>
      {activeModule !== 'cannabis' && (
        <Card>
          <p className="text-sm text-gray-700">
            The {activeModule} module UI is not yet implemented in this MVP. Switch back to Cannabis to see data.
          </p>
        </Card>
      )}
      {activeModule === 'cannabis' && (
        <>
          {/* Plants group */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">KPIs</h2>
            </div>
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPI label="Active Plants" value={kpis.activePlants} icon={<Leaf className="h-5 w-5" aria-hidden />} />
                <KPI label="Vegetative Stage" value={kpis.veg} icon={<Sprout className="h-5 w-5" aria-hidden />} />
                <KPI label="Flower Stage" value={kpis.flower} icon={<Leaf className="h-5 w-5 text-pink-600" aria-hidden />} />
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPI
                  label="Drying"
                  value={kpis.dryingCount}
                  icon={<Scissors className="h-5 w-5 text-amber-600" aria-hidden />}
                />
                <KPI
                  label="Harvested"
                  value={kpis.harvestedPlantsCount}
                  icon={<Scissors className="h-5 w-5 text-amber-600" aria-hidden />}
                />
                <KPI
                  label="Storage (g)"
                  value={`${new Intl.NumberFormat().format(Math.round(kpis.storageGrams))} g`}
                  icon={<Package2 className="h-5 w-5 text-indigo-600" aria-hidden />}
                />
              </div>
              {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPI
                  label={`Sold`}
                  value={`${new Intl.NumberFormat().format(Math.round(kpis.soldGramsInPeriod))} g`}
                  icon={<Scissors className="h-5 w-5 text-amber-600" aria-hidden />}
                  action={
                    <select
                      aria-label="Sold period"
                      value={soldPeriod}
                      onChange={(e) => setSoldPeriod(e.target.value as any)}
                      className="border rounded-md text-xs px-1.5 py-1 bg-white text-gray-700"
                    >
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="1m">Last month</option>
                      <option value="3m">Last 3 months</option>
                      <option value="6m">Last 6 months</option>
                      <option value="ytd">Year to date</option>
                      <option value="ly">Last year</option>
                      <option value="yby">Year before last</option>
                    </select>
                  }
                />
                <KPI
                  label={`Revenue`}
                  value={new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis.estRevenue)}
                  icon={<DollarSign className="h-5 w-5 text-emerald-600" aria-hidden />}
                  action={
                    <select
                      aria-label="Revenue period"
                      value={revenuePeriod}
                      onChange={(e) => setRevenuePeriod(e.target.value as any)}
                      className="border rounded-md text-xs px-1.5 py-1 bg-white text-gray-700"
                    >
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="1m">Last month</option>
                      <option value="3m">Last 3 months</option>
                      <option value="6m">Last 6 months</option>
                      <option value="ytd">Year to date</option>
                      <option value="ly">Last year</option>
                      <option value="yby">Year before last</option>
                    </select>
                  }
                />
              </div>
              {/* Row 4: Capacity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPI
                  label="Capacity Utilization"
                  value={`${Math.round(kpis.capacityUtilization)}%`}
                  icon={<Package2 className="h-5 w-5 text-purple-600" aria-hidden />}
                />
                <KPI
                  label="Empty Structures"
                  value={kpis.emptyStructures}
                  icon={<Package2 className="h-5 w-5 text-amber-600" aria-hidden />}
                />
                <KPI
                  label="Total Capacity"
                  value={`${kpis.totalOccupied}/${kpis.totalCapacity}`}
                  icon={<Package2 className="h-5 w-5 text-blue-600" aria-hidden />}
                />
              </div>
            </div>
          </Card>
        </>
      )}

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plant activity */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-2">Plant Activity</h3>
            <div className="max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100">
              {[...plants]
                .sort((a, b) => new Date(b.plantedAt).getTime() - new Date(a.plantedAt).getTime())
                .map((p) => (
                  <div key={p.id} className="p-2 text-sm text-gray-700 flex items-start gap-2 h-12">
                    <Sprout className="h-4 w-4 text-green-600 mt-0.5" aria-hidden />
                    <div className="min-w-0">
                      <div className="truncate">Planted {p.strain} at {p.location}</div>
                      <div className="text-xs text-gray-500">{new Date(p.plantedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Drying & Storage activity */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-2">Drying & Storage</h3>
            <div className="max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100">
              {[...harvests]
                .filter((h) => h.status === 'drying' || h.status === 'dried')
                .sort((a, b) => new Date(b.harvestedAt).getTime() - new Date(a.harvestedAt).getTime())
                .map((h) => (
                  <div key={h.id} className="p-2 text-sm text-gray-700 flex items-start gap-2 h-12">
                    {h.status === 'drying' ? (
                      <Scissors className="h-4 w-4 text-amber-600 mt-0.5" aria-hidden />
                    ) : (
                      <Package2 className="h-4 w-4 text-indigo-600 mt-0.5" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="truncate">
                        {h.status === 'drying' ? 'Started drying' : 'Moved to storage'} 
                        ({new Intl.NumberFormat().format(h.yieldGrams)} g)
                      </div>
                      <div className="text-xs text-gray-500">{new Date(h.harvestedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Harvest & Revenue activity */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-2">Harvest & Revenue</h3>
            <div className="max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100">
              {[...harvests]
                .sort((a, b) => new Date(b.harvestedAt).getTime() - new Date(a.harvestedAt).getTime())
                .map((h) => {
                  const pricePerGram = 6;
                  const est = h.status === 'dried' ? (Number(h.yieldGrams) || 0) * pricePerGram : null;
                  return (
                    <div key={h.id} className="p-2 text-sm text-gray-700 flex items-start gap-2 h-12">
                      <div className="flex-none flex items-center gap-1 mt-0.5">
                        <Scissors className="h-4 w-4 text-amber-600" aria-hidden />
                        {est !== null && <DollarSign className="h-3.5 w-3.5 text-emerald-600" aria-hidden />}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate">
                          Harvested {new Intl.NumberFormat().format(h.yieldGrams)} g
                          {est !== null ? ` • Est. ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(est)}` : ' • Pending drying'}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(h.harvestedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

      </Card>

      {(user?.role === 'Operator' || user?.role === 'Grower') && activeModule === 'cannabis' && (
        <Card>
          <div className="flex items-end justify-between mb-2">
            <h2 className="text-lg font-medium text-gray-900">Shortcuts</h2>
          </div>
          {shortcuts.length === 0 ? (
            <p className="text-sm text-gray-600">No suggested actions right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: urgent (red) */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500" aria-hidden />
                  <h3 className="text-sm font-medium text-rose-800">Urgent</h3>
                </div>
                <div className="space-y-2 max-h-[136px] overflow-y-auto pr-1">
                  {shortcuts.filter((s) => s.tone === 'danger').map((s, idx) => (
                    <Link
                      key={`danger-${idx}`}
                      to={s.to}
                      className={`inline-flex items-center gap-2 px-3 py-2 h-10 rounded-md text-sm border bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 w-full`}
                    >
                      {s.icon}
                      <span className="truncate">{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Right: soon (yellow) */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" aria-hidden />
                  <h3 className="text-sm font-medium text-amber-800">Soon</h3>
                </div>
                <div className="space-y-2 max-h-[136px] overflow-y-auto pr-1">
                  {shortcuts.filter((s) => s.tone === 'warn').map((s, idx) => (
                    <Link
                      key={`warn-${idx}`}
                      to={s.to}
                      className={`inline-flex items-center gap-2 px-3 py-2 h-10 rounded-md text-sm border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 w-full`}
                    >
                      {s.icon}
                      <span className="truncate">{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

  {activeModule === 'cannabis' && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-gray-900">Facility Capacity</h2>
            <Link to="/sites" className="text-sm text-primary hover:underline">View Details</Link>
          </div>
          <div className="space-y-3">
            {/* HARDCODED FACILITY CAPACITY MOCKUP */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Main Building</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">78% utilized</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>39/50 capacity</span>
                <span className="text-amber-600">2 empty structures</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-yellow-500" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Farm Area</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">86% utilized</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>12/14 capacity</span>
                <span className="text-amber-600">1 empty structure</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '86%' }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-gray-900">Upcoming</h2>
        </div>
        {calendar.length === 0 ? (
          <p className="text-sm text-gray-600">No scheduled items for the {activeModule} module.</p>
        ) : (
          <div
            ref={upcomingRef}
            onScroll={onUpcomingScroll}
            className="max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100"
          >
            {calendar.map(({ date, items }) => (
        <div key={date.toISOString()} className="p-2 h-12">
                <div className="text-xs text-gray-500 mb-1">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                {items.length === 0 ? (
                  <div className="text-xs text-gray-400">—</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {items.slice(0, 3).map((ev, idx) => (
                      <Link key={idx} to={ev.href || '/calendar'} className={`text-[11px] text-white px-1 py-0.5 rounded ${eventColor(ev.type as any)}`}>
                        <span className="truncate block">{ev.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Inline row to open full calendar; revealed only at list end */}
            <div className={`p-2 h-12 flex items-center justify-center ${showOpenCalendar ? '' : 'opacity-0 pointer-events-none select-none'}`}>
              <Link to="/calendar" className="text-sm text-primary hover:underline">Open calendar</Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
