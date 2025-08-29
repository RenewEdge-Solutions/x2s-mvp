import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
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
    const [plants, setPlants] = useState([]);
    const [harvests, setHarvests] = useState([]);
    const [soldPeriod, setSoldPeriod] = useState('1m');
    const [revenuePeriod, setRevenuePeriod] = useState('1m');
    useEffect(() => {
        if (activeModule === 'cannabis') {
            api.getPlants().then(setPlants);
            api.getHarvests().then(setHarvests);
        }
        else {
            setPlants([]);
            setHarvests([]);
        }
    }, [activeModule]);
    const ageInDays = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    const getRange = (key) => {
        const now = new Date();
        const startOfYear = (y) => new Date(y, 0, 1);
        const addMonths = (d, m) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
        const earliest = new Date(2025, 0, 1);
        let from;
        let to = now;
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
        if (to < earliest)
            return { from: earliest, to: earliest };
        if (from < earliest)
            from = earliest;
        return { from, to };
    };
    const kpis = useMemo(() => {
        const activePlants = plants.filter((p) => !p.harvested);
        const veg = activePlants.filter((p) => ageInDays(p.plantedAt) < 14).length;
        const flower = activePlants.filter((p) => ageInDays(p.plantedAt) >= 14).length;
        const dryingCount = harvests.filter((h) => h.status === 'drying').length;
        const storageGrams = harvests
            .filter((h) => h.status === 'dried')
            .reduce((sum, h) => sum + (Number(h.yieldGrams) || 0), 0);
        const inRange = (d, r) => {
            const t = new Date(d).getTime();
            return t >= r.from.getTime() && t < r.to.getTime();
        };
        const soldRange = getRange(soldPeriod);
        const revenueRange = getRange(revenuePeriod);
        const soldInPeriod = harvests.filter((h) => h.status === 'dried' && inRange(h.harvestedAt, soldRange));
        const soldGramsInPeriod = soldInPeriod.reduce((sum, h) => sum + (Number(h.yieldGrams) || 0), 0);
        const harvestsInRevenuePeriod = harvests.filter((h) => h.status === 'dried' && inRange(h.harvestedAt, revenueRange));
        const pricePerGram = 6; // simple estimate; can be made configurable later
        const estRevenue = harvestsInRevenuePeriod
            .reduce((sum, h) => sum + (Number(h.yieldGrams) || 0) * pricePerGram, 0);
        const harvestedPlantsCount = harvests.length;
        return {
            activePlants: activePlants.length,
            veg,
            flower,
            dryingCount,
            storageGrams,
            harvestedPlantsCount,
            soldGramsInPeriod,
            estRevenue,
            alerts: Math.max(0, plants.length + harvests.length - 5),
        };
    }, [plants, harvests, soldPeriod, revenuePeriod]);
    const shortcuts = useMemo(() => {
        if (activeModule !== 'cannabis')
            return [];
        const siteOf = (loc) => (loc ? (loc.includes(' - ') ? loc.split(' - ')[0] : loc) : 'Facility');
        const bySiteCounts = (items, getLoc) => {
            const counts = {};
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
        const out = [];
        // Pending harvest by top sites
        for (const [site, count] of bySiteCounts(readyForHarvest, (p) => p.location).slice(0, 4)) {
            out.push({ label: `Harvest ${site}` /* was: (${count}) */, to: '/wizard?step=2', icon: _jsx(Scissors, { className: "h-4 w-4", "aria-hidden": true }), tone: 'danger' });
        }
        // Soon-to-harvest by site
        for (const [site, count] of bySiteCounts(soonHarvest, (p) => p.location).slice(0, 2)) {
            out.push({ label: `Harvest ${site}` /* was: (${count}) */, to: '/wizard?step=2', icon: _jsx(Scissors, { className: "h-4 w-4", "aria-hidden": true }), tone: 'warn' });
        }
        // Flip candidates by site
        for (const [site, count] of bySiteCounts(flipCandidates, (p) => p.location).slice(0, 3)) {
            out.push({ label: `Flip plants in ${site}` /* was: (${count}) */, to: '/calendar', icon: _jsx(FlipHorizontal2, { className: "h-4 w-4", "aria-hidden": true }), tone: 'danger' });
        }
        // Soon-to-flip by site
        for (const [site, count] of bySiteCounts(soonFlip, (p) => p.location).slice(0, 2)) {
            out.push({ label: `Flip plants in ${site}` /* was: (${count}) */, to: '/calendar', icon: _jsx(FlipHorizontal2, { className: "h-4 w-4", "aria-hidden": true }), tone: 'warn' });
        }
        // Transplant suggestions from indoor rooms
        for (const [site, count] of bySiteCounts(transplantCandidates, (p) => p.location).slice(0, 2)) {
            out.push({ label: `Transplant from ${site}` /* was: (${count}) */, to: '/calendar', icon: _jsx(ArrowRightLeft, { className: "h-4 w-4", "aria-hidden": true }), tone: 'neutral' });
        }
        // Drying checks by site (map harvests -> plant site)
        const dryingBySite = bySiteCounts(dryingHarvests.map((h) => ({ site: siteOf(plantById.get(h.plantId)?.location) })), (x) => x.site).slice(0, 2);
        for (const [site, count] of dryingBySite) {
            out.push({ label: `Check drying in ${site}` /* was: (${count}) */, to: '/inventory', icon: _jsx(Scissors, { className: "h-4 w-4", "aria-hidden": true }), tone: 'neutral' });
        }
        return out.slice(0, 10); // cap to 10 as requested to preview crowded UI
    }, [plants, harvests, activeModule]);
    const calendar = useMemo(() => {
        if (activeModule !== 'cannabis')
            return [];
        const evs = computeEventsForCannabis(plants, harvests);
        // prepare next 14 days; list is scrollable so only ~3 rows are visible
        return nextNDays(evs, 14);
    }, [plants, harvests, activeModule]);
    // Track scroll end for Upcoming list to reveal "Open calendar" only at the end
    const upcomingRef = useRef(null);
    const [showOpenCalendar, setShowOpenCalendar] = useState(false);
    const onUpcomingScroll = () => {
        const el = upcomingRef.current;
        if (!el)
            return;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2; // tolerance
        setShowOpenCalendar(atBottom);
    };
    useEffect(() => {
        // reset when data/module changes
        setShowOpenCalendar(false);
    }, [calendar.length, activeModule]);
    if (activeModule === 'alcohol') {
        return _jsx(AlcoholDashboard, {});
    }
    if (activeModule === 'mushrooms') {
        return _jsx(MushroomsDashboard, {});
    }
    if (activeModule === 'explosives') {
        return _jsx(ExplosivesDashboard, {});
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("h1", { className: "text-2xl font-semibold text-gray-900", children: ["Welcome, ", user?.firstName || user?.lastName ? `${user?.firstName} ${user?.lastName}`.trim() : user?.username] }), activeModule !== 'cannabis' && (_jsx(Card, { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["The ", activeModule, " module UI is not yet implemented in this MVP. Switch back to Cannabis to see data."] }) })), activeModule === 'cannabis' && (_jsx(_Fragment, { children: _jsxs(Card, { children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx("h2", { className: "text-lg font-medium text-gray-900", children: "KPIs" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(KPI, { label: "Active Plants", value: kpis.activePlants, icon: _jsx(Leaf, { className: "h-5 w-5", "aria-hidden": true }) }), _jsx(KPI, { label: "Vegetative Stage", value: kpis.veg, icon: _jsx(Sprout, { className: "h-5 w-5", "aria-hidden": true }) }), _jsx(KPI, { label: "Flower Stage", value: kpis.flower, icon: _jsx(Leaf, { className: "h-5 w-5 text-pink-600", "aria-hidden": true }) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(KPI, { label: "Drying", value: kpis.dryingCount, icon: _jsx(Scissors, { className: "h-5 w-5 text-amber-600", "aria-hidden": true }) }), _jsx(KPI, { label: "Harvested", value: kpis.harvestedPlantsCount, icon: _jsx(Scissors, { className: "h-5 w-5 text-amber-600", "aria-hidden": true }) }), _jsx(KPI, { label: "Storage (g)", value: `${new Intl.NumberFormat().format(Math.round(kpis.storageGrams))} g`, icon: _jsx(Package2, { className: "h-5 w-5 text-indigo-600", "aria-hidden": true }) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(KPI, { label: `Sold`, value: `${new Intl.NumberFormat().format(Math.round(kpis.soldGramsInPeriod))} g`, icon: _jsx(Scissors, { className: "h-5 w-5 text-amber-600", "aria-hidden": true }), action: _jsxs("select", { "aria-label": "Sold period", value: soldPeriod, onChange: (e) => setSoldPeriod(e.target.value), className: "border rounded-md text-xs px-1.5 py-1 bg-white text-gray-700", children: [_jsx("option", { value: "24h", children: "Last 24 hours" }), _jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "1m", children: "Last month" }), _jsx("option", { value: "3m", children: "Last 3 months" }), _jsx("option", { value: "6m", children: "Last 6 months" }), _jsx("option", { value: "ytd", children: "Year to date" }), _jsx("option", { value: "ly", children: "Last year" }), _jsx("option", { value: "yby", children: "Year before last" })] }) }), _jsx(KPI, { label: `Revenue`, value: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis.estRevenue), icon: _jsx(DollarSign, { className: "h-5 w-5 text-emerald-600", "aria-hidden": true }), action: _jsxs("select", { "aria-label": "Revenue period", value: revenuePeriod, onChange: (e) => setRevenuePeriod(e.target.value), className: "border rounded-md text-xs px-1.5 py-1 bg-white text-gray-700", children: [_jsx("option", { value: "24h", children: "Last 24 hours" }), _jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "1m", children: "Last month" }), _jsx("option", { value: "3m", children: "Last 3 months" }), _jsx("option", { value: "6m", children: "Last 6 months" }), _jsx("option", { value: "ytd", children: "Year to date" }), _jsx("option", { value: "ly", children: "Last year" }), _jsx("option", { value: "yby", children: "Year before last" })] }) })] })] })] }) })), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-3", children: "Recent Activity" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-800 mb-2", children: "Plant Activity" }), _jsx("div", { className: "max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100", children: [...plants]
                                            .sort((a, b) => new Date(b.plantedAt).getTime() - new Date(a.plantedAt).getTime())
                                            .map((p) => (_jsxs("div", { className: "p-2 text-sm text-gray-700 flex items-start gap-2 h-12", children: [_jsx(Sprout, { className: "h-4 w-4 text-green-600 mt-0.5", "aria-hidden": true }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "truncate", children: ["Planted ", p.strain, " at ", p.location] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(p.plantedAt).toLocaleString() })] })] }, p.id))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-800 mb-2", children: "Drying & Storage" }), _jsx("div", { className: "max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100", children: [...harvests]
                                            .filter((h) => h.status === 'drying' || h.status === 'dried')
                                            .sort((a, b) => new Date(b.harvestedAt).getTime() - new Date(a.harvestedAt).getTime())
                                            .map((h) => (_jsxs("div", { className: "p-2 text-sm text-gray-700 flex items-start gap-2 h-12", children: [h.status === 'drying' ? (_jsx(Scissors, { className: "h-4 w-4 text-amber-600 mt-0.5", "aria-hidden": true })) : (_jsx(Package2, { className: "h-4 w-4 text-indigo-600 mt-0.5", "aria-hidden": true })), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "truncate", children: [h.status === 'drying' ? 'Started drying' : 'Moved to storage', "(", new Intl.NumberFormat().format(h.yieldGrams), " g)"] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(h.harvestedAt).toLocaleString() })] })] }, h.id))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-gray-800 mb-2", children: "Harvest & Revenue" }), _jsx("div", { className: "max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100", children: [...harvests]
                                            .sort((a, b) => new Date(b.harvestedAt).getTime() - new Date(a.harvestedAt).getTime())
                                            .map((h) => {
                                            const pricePerGram = 6;
                                            const est = h.status === 'dried' ? (Number(h.yieldGrams) || 0) * pricePerGram : null;
                                            return (_jsxs("div", { className: "p-2 text-sm text-gray-700 flex items-start gap-2 h-12", children: [_jsxs("div", { className: "flex-none flex items-center gap-1 mt-0.5", children: [_jsx(Scissors, { className: "h-4 w-4 text-amber-600", "aria-hidden": true }), est !== null && _jsx(DollarSign, { className: "h-3.5 w-3.5 text-emerald-600", "aria-hidden": true })] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "truncate", children: ["Harvested ", new Intl.NumberFormat().format(h.yieldGrams), " g", est !== null ? ` • Est. ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(est)}` : ' • Pending drying'] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(h.harvestedAt).toLocaleString() })] })] }, h.id));
                                        }) })] })] })] }), (user?.role === 'Operator' || user?.role === 'Grower') && activeModule === 'cannabis' && (_jsxs(Card, { children: [_jsx("div", { className: "flex items-end justify-between mb-2", children: _jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Shortcuts" }) }), shortcuts.length === 0 ? (_jsx("p", { className: "text-sm text-gray-600", children: "No suggested actions right now." })) : (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-rose-500", "aria-hidden": true }), _jsx("h3", { className: "text-sm font-medium text-rose-800", children: "Urgent" })] }), _jsx("div", { className: "space-y-2 max-h-[136px] overflow-y-auto pr-1", children: shortcuts.filter((s) => s.tone === 'danger').map((s, idx) => (_jsxs(Link, { to: s.to, className: `inline-flex items-center gap-2 px-3 py-2 h-10 rounded-md text-sm border bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 w-full`, children: [s.icon, _jsx("span", { className: "truncate", children: s.label })] }, `danger-${idx}`))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-amber-500", "aria-hidden": true }), _jsx("h3", { className: "text-sm font-medium text-amber-800", children: "Soon" })] }), _jsx("div", { className: "space-y-2 max-h-[136px] overflow-y-auto pr-1", children: shortcuts.filter((s) => s.tone === 'warn').map((s, idx) => (_jsxs(Link, { to: s.to, className: `inline-flex items-center gap-2 px-3 py-2 h-10 rounded-md text-sm border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 w-full`, children: [s.icon, _jsx("span", { className: "truncate", children: s.label })] }, `warn-${idx}`))) })] })] }))] })), _jsxs(Card, { children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Upcoming" }) }), calendar.length === 0 ? (_jsxs("p", { className: "text-sm text-gray-600", children: ["No scheduled items for the ", activeModule, " module."] })) : (_jsxs("div", { ref: upcomingRef, onScroll: onUpcomingScroll, className: "max-h-[156px] overflow-y-auto border rounded-md divide-y divide-gray-100", children: [calendar.map(({ date, items }) => (_jsxs("div", { className: "p-2 h-12", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }), items.length === 0 ? (_jsx("div", { className: "text-xs text-gray-400", children: "\u2014" })) : (_jsx("div", { className: "flex flex-wrap gap-1", children: items.slice(0, 3).map((ev, idx) => (_jsx(Link, { to: ev.href || '/calendar', className: `text-[11px] text-white px-1 py-0.5 rounded ${eventColor(ev.type)}`, children: _jsx("span", { className: "truncate block", children: ev.label }) }, idx))) }))] }, date.toISOString()))), _jsx("div", { className: `p-2 h-12 flex items-center justify-center ${showOpenCalendar ? '' : 'opacity-0 pointer-events-none select-none'}`, children: _jsx(Link, { to: "/calendar", className: "text-sm text-primary hover:underline", children: "Open calendar" }) })] }))] })] }));
}
